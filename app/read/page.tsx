"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { useAppGuard } from "@/lib/useAppGuard";
import { Screen, PrimaryButton } from "@/components/ui";

type Mode = "morning" | "daytime" | "night";

const copy: Record<Mode, { label: string; hint: string; cta: string }> = {
  morning: {
    label: "아침 · 실현 목록",
    hint: "입가에 웃음을 지으며, 실현된 모습을 상상하며 읽어보세요.",
    cta: "다 읽었어요 ✓",
  },
  daytime: {
    label: "일상 · 목표 떠올리기",
    hint: "목표를 달성하려면 어떻게 해야 하는가? 무엇이 필요할까?",
    cta: "다 읽었어요 ✓",
  },
  night: {
    label: "밤 · 실현 목록",
    hint: "입가에 웃음을 지으며, 실현된 모습을 상상하며 읽어보세요.",
    cta: "Daily on 작성하러 가기 →",
  },
};

function ReadContent() {
  const router = useRouter();
  const params = useSearchParams();
  const modeParam = params.get("mode");
  const mode: Mode = modeParam === "daytime" ? "daytime" : modeParam === "night" ? "night" : "morning";
  const { roadmap, daily } = useStore();
  useAppGuard();

  const smartGoals = daily?.goals.map((g) => g.specific).filter(Boolean) ?? [];
  const lines = mode === "daytime" && smartGoals.length > 0 ? smartGoals : roadmap.realizations;

  function done() {
    if (mode === "night") router.replace("/daily");
    else router.replace(`/today?done=${mode}`);
  }

  return (
    <Screen>
      <div style={{ flex: 1, padding: "18px 14px", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "2px 6px 8px" }}>
          <button
            onClick={() => router.replace("/today")}
            style={{ background: "none", border: "none", fontSize: 20, color: "var(--color-ink-muted)", cursor: "pointer" }}
            aria-label="닫기"
          >
            ✕
          </button>
          <span style={{ fontSize: 13, color: "var(--color-ink-muted)" }}>{copy[mode].label}</span>
          <span style={{ width: 20 }} />
        </div>

        <div
          style={{
            background: "var(--color-brand-soft)",
            borderRadius: 14,
            padding: "13px 14px",
            marginBottom: 14,
            fontSize: 12,
            color: "var(--color-brand-text)",
            lineHeight: 1.5,
          }}
        >
          {copy[mode].hint}
        </div>

        <div
          style={{
            background: "var(--color-surface)",
            borderRadius: 18,
            padding: 18,
            boxShadow: "0 6px 20px rgba(60,70,110,0.08)",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {lines.map((line, k) => (
            <div key={k} style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
              <span style={{ color: "var(--color-brand)", fontSize: 15, lineHeight: 1.5 }}>•</span>
              <span style={{ fontSize: 17, fontWeight: 500, color: "var(--color-ink)", lineHeight: 1.5 }}>{line}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 14 }}>
          <PrimaryButton onClick={done}>{copy[mode].cta}</PrimaryButton>
        </div>
      </div>
    </Screen>
  );
}

export default function ReadPage() {
  return (
    <Suspense fallback={null}>
      <ReadContent />
    </Suspense>
  );
}
