"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { useAppGuard } from "@/lib/useAppGuard";
import { calcStreak } from "@/lib/streak";
import { Screen, BottomNav } from "@/components/ui";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

type Phase = "morning" | "daytime" | "night";

function currentPhase(): Phase {
  const h = new Date().getHours();
  if (h < 11) return "morning";
  if (h < 20) return "daytime";
  return "night";
}

const reminderCopy: Record<Phase, { title: string; message: string; href: string }> = {
  morning: { title: "아침 리마인드", message: "실현 목록을 읽을 시간이에요.", href: "/read?mode=morning" },
  daytime: { title: "일상 리마인드", message: "잠깐, 목표를 떠올려볼까요?", href: "/read?mode=daytime" },
  night: { title: "밤 리마인드", message: "목록을 읽고 오늘의 Daily on을 채워보세요.", href: "/read?mode=night" },
};

function TodayContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { daily, completedDates } = useStore();
  const [morningDone, setMorningDone] = useState(false);
  const [daytimeDone, setDaytimeDone] = useState(false);

  useAppGuard();

  useEffect(() => {
    const done = params.get("done");
    if (done === "morning") setMorningDone(true);
    if (done === "daytime") setDaytimeDone(true);
    if (done) router.replace("/today");
  }, [params, router]);

  const nightDone = daily?.date === todayStr();
  const streak = calcStreak(completedDates);
  const phase = currentPhase();
  const phaseDone = phase === "morning" ? morningDone : phase === "daytime" ? daytimeDone : nightDone;
  const reminder = reminderCopy[phase];

  return (
    <Screen>
      <div style={{ flex: 1, padding: "18px 14px 8px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 4px", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 500 }}>안녕하세요</div>
            <div style={{ fontSize: 12, color: "var(--color-ink-muted)", marginTop: 2 }}>오늘도 목표에 한 걸음.</div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              background: "var(--color-surface)",
              borderRadius: 16,
              padding: "6px 11px",
              boxShadow: "0 3px 10px rgba(60,70,110,0.07)",
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            🔥 {streak}일
          </div>
        </div>

        {!phaseDone && (
          <Link
            href={reminder.href}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: "var(--color-brand-soft)",
              border: "1px solid var(--color-brand-border)",
              borderRadius: 16,
              padding: 14,
              marginBottom: 14,
              textDecoration: "none",
            }}
          >
            <span style={{ fontSize: 20 }}>🔔</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-brand-text)" }}>{reminder.title}</div>
              <div style={{ fontSize: 12, color: "var(--color-brand-text)", marginTop: 2 }}>{reminder.message}</div>
            </div>
            <span style={{ color: "var(--color-brand)", fontSize: 18 }}>›</span>
          </Link>
        )}

        <div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-ink-muted)", margin: "0 4px 9px" }}>오늘의 루프</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <LoopLink
            title="아침 · 실현 목록 읽기"
            sub={morningDone ? "오늘 완료" : "상상하며 천천히"}
            done={morningDone}
            href="/read?mode=morning"
          />
          <LoopLink
            title="일상 · 목표 떠올리기"
            sub={daytimeDone ? "오늘 완료" : "틈틈이 한 번씩"}
            done={daytimeDone}
            href="/read?mode=daytime"
          />
          <LoopLink
            title="밤 · 목록 읽기 + Daily on"
            sub={nightDone ? "오늘 완료" : "지금 할 차례"}
            done={nightDone}
            href="/read?mode=night"
          />
        </div>
      </div>

      <BottomNav active="today" />
    </Screen>
  );
}

export default function TodayPage() {
  return (
    <Suspense fallback={null}>
      <TodayContent />
    </Suspense>
  );
}

function itemBox(highlight: boolean) {
  return {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: 14,
    background: "var(--color-surface)",
    borderRadius: 16,
    boxShadow: "0 4px 14px rgba(60,70,110,0.07)",
    border: highlight ? "1.5px solid var(--color-brand-border)" : "1.5px solid transparent",
    cursor: "pointer",
    textDecoration: "none",
    color: "var(--color-ink)",
  } as const;
}

function LoopLink({ title, sub, done, href }: { title: string; sub: string; done: boolean; href: string }) {
  return (
    <Link href={href} style={itemBox(!done)}>
      <Body title={title} sub={sub} highlight={!done} />
      <span style={{ fontSize: 20, color: done ? "#22a06b" : "var(--color-brand)" }}>{done ? "✓" : "›"}</span>
    </Link>
  );
}

function Body({ title, sub, highlight = false }: { title: string; sub: string; highlight?: boolean }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 14, fontWeight: 500 }}>{title}</div>
      <div style={{ fontSize: 12, color: highlight ? "var(--color-brand)" : "var(--color-ink-muted)" }}>{sub}</div>
    </div>
  );
}
