import type { SupabaseClient } from "@supabase/supabase-js";
import type { RoadmapData, SmartGoal, DailyEntry, ReminderSettings, Inquiry, InquiryType } from "../types";

type ListField = "dislikes" | "likes" | "realizations";

async function getCurrentVersionId(db: SupabaseClient, userId: string): Promise<number | null> {
  const { data } = await db
    .from("roadmap_versions")
    .select("id")
    .eq("user_id", userId)
    .eq("is_current", true)
    .maybeSingle();
  return (data?.id as number | undefined) ?? null;
}

async function createVersion(db: SupabaseClient, userId: string): Promise<number> {
  const { data: last } = await db
    .from("roadmap_versions")
    .select("version_no")
    .eq("user_id", userId)
    .order("version_no", { ascending: false })
    .limit(1);
  const nextNo = ((last?.[0]?.version_no as number | undefined) ?? 0) + 1;

  const { data: inserted, error } = await db
    .from("roadmap_versions")
    .insert({ user_id: userId, version_no: nextNo, is_current: true })
    .select("id")
    .single();
  if (error) throw error;
  return inserted.id as number;
}

export async function ensureVersion(db: SupabaseClient, userId: string): Promise<number> {
  const existing = await getCurrentVersionId(db, userId);
  if (existing) return existing;
  return createVersion(db, userId);
}

// "새로 작성" — 기존 버전은 보존(is_current=false)하고 새 버전을 현재 버전으로 만든다.
export async function startNewVersion(db: SupabaseClient, userId: string): Promise<number> {
  await db.from("roadmap_versions").update({ is_current: false }).eq("user_id", userId).eq("is_current", true);
  return createVersion(db, userId);
}

export async function loadRoadmap(db: SupabaseClient, userId: string): Promise<RoadmapData> {
  const versionId = await getCurrentVersionId(db, userId);
  if (!versionId) return { dislikes: [], likes: [], compass: "", realizations: [] };

  const [dislikes, likes, compass, realizations] = await Promise.all([
    db.from("dislikes").select("content").eq("version_id", versionId).order("sort"),
    db.from("likes").select("content").eq("version_id", versionId).order("sort"),
    db.from("compass").select("content").eq("version_id", versionId).maybeSingle(),
    db.from("realizations").select("content").eq("version_id", versionId).order("sort"),
  ]);

  return {
    dislikes: (dislikes.data ?? []).map((r) => r.content as string),
    likes: (likes.data ?? []).map((r) => r.content as string),
    compass: (compass.data?.content as string | undefined) ?? "",
    realizations: (realizations.data ?? []).map((r) => r.content as string),
  };
}

export async function saveListField(
  db: SupabaseClient,
  userId: string,
  versionId: number,
  field: ListField,
  items: string[],
) {
  await db.from(field).delete().eq("version_id", versionId);
  if (items.length === 0) return;
  await db
    .from(field)
    .insert(items.map((content, i) => ({ user_id: userId, version_id: versionId, content, sort: i })));
}

export async function saveCompass(db: SupabaseClient, userId: string, versionId: number, content: string) {
  const { data: existing } = await db
    .from("compass")
    .select("id")
    .eq("version_id", versionId)
    .maybeSingle();
  if (existing) {
    await db.from("compass").update({ content }).eq("id", existing.id);
  } else {
    await db.from("compass").insert({ user_id: userId, version_id: versionId, content });
  }
}

export async function loadLatestDaily(db: SupabaseClient, userId: string): Promise<DailyEntry | null> {
  const { data: dateRow } = await db
    .from("short_term_goals")
    .select("date")
    .eq("user_id", userId)
    .order("date", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!dateRow) return null;
  const date = dateRow.date as string;

  const [{ data: goalRows }, { data: actionRow }] = await Promise.all([
    db.from("short_term_goals").select("*").eq("user_id", userId).eq("date", date).order("no"),
    db.from("daily_actions").select("content").eq("user_id", userId).eq("date", date).maybeSingle(),
  ]);

  const goals: SmartGoal[] = (goalRows ?? []).map((r) => ({
    specific: (r.specific as string | null) ?? "",
    measurable: (r.measurable as string | null) ?? "",
    agreed: (r.agreed as string | null) ?? "",
    realistic: (r.realistic as string | null) ?? "",
    timely: (r.timely as string | null) ?? "",
    important: Boolean(r.is_important),
  }));

  return { date, goals, action: (actionRow?.content as string | undefined) ?? "" };
}

export async function loadCompletedDates(db: SupabaseClient, userId: string): Promise<string[]> {
  const { data } = await db.from("short_term_goals").select("date").eq("user_id", userId);
  return Array.from(new Set((data ?? []).map((r) => r.date as string)));
}

export async function saveDailyEntry(db: SupabaseClient, userId: string, entry: DailyEntry) {
  await db.from("short_term_goals").delete().eq("user_id", userId).eq("date", entry.date);
  if (entry.goals.length > 0) {
    await db.from("short_term_goals").insert(
      entry.goals.map((g, i) => ({
        user_id: userId,
        date: entry.date,
        no: i + 1,
        specific: g.specific,
        measurable: g.measurable,
        agreed: g.agreed,
        realistic: g.realistic,
        timely: g.timely,
        is_important: g.important,
      })),
    );
  }

  const { data: existingAction } = await db
    .from("daily_actions")
    .select("id")
    .eq("user_id", userId)
    .eq("date", entry.date)
    .maybeSingle();
  if (existingAction) {
    await db.from("daily_actions").update({ content: entry.action }).eq("id", existingAction.id);
  } else {
    await db.from("daily_actions").insert({ user_id: userId, date: entry.date, content: entry.action });
  }
}

export async function loadProfile(
  db: SupabaseClient,
  userId: string,
): Promise<{ pinHash: string | null; stage1Done: boolean }> {
  const { data } = await db
    .from("profiles")
    .select("pin_hash, onboarding_step")
    .eq("user_id", userId)
    .maybeSingle();
  return {
    pinHash: (data?.pin_hash as string | null | undefined) ?? null,
    stage1Done: data?.onboarding_step === "completed",
  };
}

export async function markStage1Complete(db: SupabaseClient, userId: string) {
  await db.from("profiles").update({ onboarding_step: "completed" }).eq("user_id", userId);
}

export async function savePinHash(db: SupabaseClient, userId: string, pinHash: string) {
  await db.from("profiles").update({ pin_hash: pinHash }).eq("user_id", userId);
}

const DEFAULT_REMINDER: ReminderSettings = {
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

// dnd_start/dnd_end에는 "끔" 상태를 표현하는 별도 컬럼이 없으므로,
// 두 값이 같으면(00:00~00:00) 꺼짐으로 취급한다.
const DND_OFF = "00:00";

export async function loadReminderSettings(db: SupabaseClient, userId: string): Promise<ReminderSettings> {
  const { data } = await db
    .from("reminder_settings")
    .select(
      "morning_at, night_at, random_enabled, random_per_day, random_window_start, random_window_end, dnd_start, dnd_end",
    )
    .eq("user_id", userId)
    .maybeSingle();
  if (!data) return DEFAULT_REMINDER;

  const dndStart = (data.dnd_start as string | null)?.slice(0, 5) ?? DEFAULT_REMINDER.dndStart;
  const dndEnd = (data.dnd_end as string | null)?.slice(0, 5) ?? DEFAULT_REMINDER.dndEnd;

  return {
    morningAt: (data.morning_at as string | null)?.slice(0, 5) ?? null,
    nightAt: (data.night_at as string | null)?.slice(0, 5) ?? null,
    randomEnabled: (data.random_enabled as boolean | null) ?? false,
    randomPerDay: (data.random_per_day as number | null) ?? DEFAULT_REMINDER.randomPerDay,
    randomWindowStart: (data.random_window_start as string | null)?.slice(0, 5) ?? DEFAULT_REMINDER.randomWindowStart,
    randomWindowEnd: (data.random_window_end as string | null)?.slice(0, 5) ?? DEFAULT_REMINDER.randomWindowEnd,
    dndEnabled: dndStart !== dndEnd,
    dndStart,
    dndEnd,
  };
}

export async function saveReminderSettings(
  db: SupabaseClient,
  userId: string,
  patch: Partial<ReminderSettings>,
) {
  const row: Record<string, unknown> = { user_id: userId };
  if (patch.morningAt !== undefined) row.morning_at = patch.morningAt;
  if (patch.nightAt !== undefined) row.night_at = patch.nightAt;
  if (patch.randomEnabled !== undefined) row.random_enabled = patch.randomEnabled;
  if (patch.randomPerDay !== undefined) row.random_per_day = patch.randomPerDay;
  if (patch.randomWindowStart !== undefined) row.random_window_start = patch.randomWindowStart;
  if (patch.randomWindowEnd !== undefined) row.random_window_end = patch.randomWindowEnd;
  if (patch.dndEnabled !== undefined) {
    if (patch.dndEnabled) {
      row.dnd_start = patch.dndStart ?? DEFAULT_REMINDER.dndStart;
      row.dnd_end = patch.dndEnd ?? DEFAULT_REMINDER.dndEnd;
    } else {
      row.dnd_start = DND_OFF;
      row.dnd_end = DND_OFF;
    }
  } else {
    if (patch.dndStart !== undefined) row.dnd_start = patch.dndStart;
    if (patch.dndEnd !== undefined) row.dnd_end = patch.dndEnd;
  }
  await db.from("reminder_settings").upsert(row, { onConflict: "user_id" });
}

export async function createInquiry(
  db: SupabaseClient,
  userId: string,
  type: InquiryType,
  content: string,
) {
  const { error } = await db.from("inquiries").insert({ user_id: userId, type, content });
  if (error) throw error;
}

export async function loadMyInquiries(db: SupabaseClient, userId: string): Promise<Inquiry[]> {
  const { data } = await db
    .from("inquiries")
    .select("id, type, content, status, admin_reply, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return (data ?? []).map((r) => ({
    id: r.id as number,
    type: r.type as InquiryType,
    content: r.content as string,
    status: r.status as Inquiry["status"],
    adminReply: (r.admin_reply as string | null) ?? null,
    createdAt: (r.created_at as string).slice(0, 10),
  }));
}
