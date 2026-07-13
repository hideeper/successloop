"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { createClient } from "./supabase/client";
import {
  agreeToTerms as agreeToTermsRequest,
  ensureVersion,
  loadCompletedDates,
  loadLatestDaily,
  loadProfile,
  loadReminderSettings,
  loadRoadmap,
  markStage1Complete,
  saveCompass,
  saveDailyEntry,
  saveListField,
  savePinHash,
  saveReminderSettings,
  startNewVersion,
} from "./supabase/data";
import { hashPin } from "./pin";
import type { AuthUser, RoadmapData, DailyEntry, ReminderSettings } from "./types";

const defaultReminder: ReminderSettings = {
  morningAt: "07:00",
  nightAt: "22:00",
  randomEnabled: false,
  randomPerDay: 3,
  randomWindowStart: "09:00",
  randomWindowEnd: "21:00",
  dndEnabled: true,
  dndStart: "23:00",
  dndEnd: "07:00",
};

const emptyRoadmap: RoadmapData = {
  dislikes: [],
  likes: [],
  compass: "",
  realizations: [],
};

function sessionToUser(session: Session | null): AuthUser | null {
  if (!session?.user?.email) return null;
  return {
    email: session.user.email,
    marketingOptIn: Boolean(session.user.user_metadata?.marketing_opt_in),
  };
}

interface Store {
  hydrated: boolean;
  unlocked: boolean;
  user: AuthUser | null;
  userId: string | null;
  authError: string | null;
  roadmap: RoadmapData;
  stage1Done: boolean;
  daily: DailyEntry | null;
  completedDates: string[];
  hasPin: boolean;
  termsAgreed: boolean;
  reminderSettings: ReminderSettings;
  signUp: (email: string, password: string, marketingOptIn: boolean) => Promise<boolean>;
  signIn: (email: string, password: string) => Promise<boolean>;
  signInWithProvider: (provider: "google" | "kakao") => Promise<void>;
  agreeToTerms: (marketingOptIn: boolean) => Promise<void>;
  logout: () => Promise<void>;
  setRoadmap: (patch: Partial<RoadmapData>) => Promise<void>;
  startNewRoadmap: () => Promise<void>;
  completeStage1: () => Promise<void>;
  saveDaily: (entry: DailyEntry) => Promise<void>;
  setPin: (pin: string) => Promise<void>;
  verifyPin: (candidate: string) => Promise<boolean>;
  setReminderSettings: (patch: Partial<ReminderSettings>) => Promise<void>;
  unlock: () => void;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [supabase] = useState(() => createClient());

  const [unlocked, setUnlocked] = useState(false);

  const [user, setUser] = useState<AuthUser | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const [dataLoading, setDataLoading] = useState(true);
  const [roadmap, setRoadmapState] = useState<RoadmapData>(emptyRoadmap);
  const [stage1Done, setStage1Done] = useState(false);
  const [daily, setDaily] = useState<DailyEntry | null>(null);
  const [completedDates, setCompletedDates] = useState<string[]>([]);
  const [pinHash, setPinHash] = useState<string | null>(null);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [reminderSettings, setReminderSettingsState] = useState<ReminderSettings>(defaultReminder);
  const versionIdRef = useRef<number | null>(null);

  // 실제 인증 세션 (Supabase Auth)
  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return;
      setUser(sessionToUser(session));
      setUserId(session?.user?.id ?? null);
      setAuthLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(sessionToUser(session));
      setUserId(session?.user?.id ?? null);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  // 로그인된 사용자의 데이터(로드맵·Daily on·PIN)를 Supabase에서 로드
  useEffect(() => {
    if (authLoading) return;
    if (!userId) {
      versionIdRef.current = null;
      setRoadmapState(emptyRoadmap);
      setStage1Done(false);
      setDaily(null);
      setCompletedDates([]);
      setPinHash(null);
      setTermsAgreed(false);
      setReminderSettingsState(defaultReminder);
      setDataLoading(false);
      return;
    }
    let active = true;
    setDataLoading(true);
    (async () => {
      const [profile, roadmapData, dailyEntry, dates, reminder] = await Promise.all([
        loadProfile(supabase, userId),
        loadRoadmap(supabase, userId),
        loadLatestDaily(supabase, userId),
        loadCompletedDates(supabase, userId),
        loadReminderSettings(supabase, userId),
      ]);
      if (!active) return;
      setStage1Done(profile.stage1Done);
      setPinHash(profile.pinHash);
      setTermsAgreed(profile.termsAgreed);
      setRoadmapState(roadmapData);
      setDaily(dailyEntry);
      setCompletedDates(dates);
      setReminderSettingsState(reminder);
      setDataLoading(false);
      // 활동 시각 기록 (관리자 대시보드 활성 사용자 집계용, 실패해도 무시)
      supabase.from("profiles").update({ last_active_at: new Date().toISOString() }).eq("user_id", userId);
    })();
    return () => {
      active = false;
    };
  }, [userId, authLoading, supabase]);

  async function signUp(email: string, password: string, marketingOptIn: boolean) {
    setAuthError(null);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { marketing_opt_in: marketingOptIn } },
    });
    if (error) {
      setAuthError(error.message);
      return false;
    }
    // 이메일 가입은 자체 동의 화면을 이미 거쳤으므로 바로 동의 완료로 기록한다.
    if (data.user) {
      await agreeToTermsRequest(supabase, data.user.id, marketingOptIn);
      setTermsAgreed(true);
    }
    return true;
  }

  async function signIn(email: string, password: string) {
    setAuthError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setAuthError(error.message);
      return false;
    }
    return true;
  }

  async function signInWithProvider(provider: "google" | "kakao") {
    setAuthError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setAuthError(error.message);
  }

  // 소셜 로그인은 별도 동의 화면이 없으므로, 최초 로그인 시 /consent에서 한 번 동의를 받는다.
  async function agreeToTerms(marketingOptIn: boolean) {
    if (!userId) return;
    await agreeToTermsRequest(supabase, userId, marketingOptIn);
    setTermsAgreed(true);
  }

  async function logout() {
    await supabase.auth.signOut();
    setUnlocked(false);
  }

  async function setRoadmap(patch: Partial<RoadmapData>) {
    if (!userId) return;
    setRoadmapState((s) => ({ ...s, ...patch }));

    let versionId = versionIdRef.current;
    if (!versionId) {
      versionId = await ensureVersion(supabase, userId);
      versionIdRef.current = versionId;
    }

    const tasks: Promise<unknown>[] = [];
    if (patch.dislikes) tasks.push(saveListField(supabase, userId, versionId, "dislikes", patch.dislikes));
    if (patch.likes) tasks.push(saveListField(supabase, userId, versionId, "likes", patch.likes));
    if (patch.realizations)
      tasks.push(saveListField(supabase, userId, versionId, "realizations", patch.realizations));
    if (patch.compass !== undefined) tasks.push(saveCompass(supabase, userId, versionId, patch.compass));
    await Promise.all(tasks);
  }

  async function startNewRoadmap() {
    if (!userId) return;
    const newVersionId = await startNewVersion(supabase, userId);
    versionIdRef.current = newVersionId;
    setRoadmapState(emptyRoadmap);
    setStage1Done(false);
  }

  async function completeStage1() {
    if (!userId) return;
    setStage1Done(true);
    await markStage1Complete(supabase, userId);
  }

  async function saveDaily(entry: DailyEntry) {
    if (!userId) return;
    setDaily(entry);
    setCompletedDates((s) => (s.includes(entry.date) ? s : [...s, entry.date]));
    await saveDailyEntry(supabase, userId, entry);
  }

  async function setPin(pin: string) {
    if (!userId) return;
    const hash = await hashPin(pin, userId);
    setPinHash(hash);
    await savePinHash(supabase, userId, hash);
  }

  async function verifyPin(candidate: string) {
    if (!userId || !pinHash) return false;
    const hash = await hashPin(candidate, userId);
    return hash === pinHash;
  }

  async function setReminderSettings(patch: Partial<ReminderSettings>) {
    if (!userId) return;
    setReminderSettingsState((s) => ({ ...s, ...patch }));
    await saveReminderSettings(supabase, userId, patch);
  }

  const value: Store = {
    hydrated: !authLoading && !dataLoading,
    unlocked,
    user,
    userId,
    authError,
    roadmap,
    stage1Done,
    daily,
    completedDates,
    hasPin: pinHash !== null,
    termsAgreed,
    reminderSettings,
    signUp,
    signIn,
    signInWithProvider,
    agreeToTerms,
    logout,
    setRoadmap,
    startNewRoadmap,
    completeStage1,
    saveDaily,
    setPin,
    verifyPin,
    setReminderSettings,
    unlock: () => setUnlocked(true),
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
