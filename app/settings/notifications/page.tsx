"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { useAppGuard } from "@/lib/useAppGuard";
import { Screen, TopBar, PrimaryButton } from "@/components/ui";
import type { ReminderSettings } from "@/lib/types";

export default function NotificationTimesPage() {
  const router = useRouter();
  const { reminderSettings, setReminderSettings } = useStore();
  useAppGuard();

  const [draft, setDraft] = useState<ReminderSettings>(reminderSettings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // 스토어 값이 로드/변경되면 초안 동기화
  useEffect(() => {
    setDraft(reminderSettings);
  }, [reminderSettings]);

  const dirty = draft.morningAt !== reminderSettings.morningAt || draft.nightAt !== reminderSettings.nightAt;

  async function apply() {
    setSaving(true);
    setSaved(false);
    await setReminderSettings(draft);
    setSaving(false);
    setSaved(true);
  }

  return (
    <Screen>
      <TopBar title="알림 시간 설정" onBack={() => router.replace("/settings")} />

      <div style={{ flex: 1, padding: "8px 14px 20px", display: "flex", flexDirection: "column" }}>
        <p style={{ fontSize: 12, color: "var(--color-ink-muted)", margin: "0 4px 16px", lineHeight: 1.5 }}>
          설정한 시각에 실현 목록을 읽으라는 알림을 보내드려요. (한국시간 기준)
        </p>

        <TimeRow
          icon="🌅"
          label="아침 알림"
          value={draft.morningAt}
          defaultTime="07:00"
          onChange={(v) => {
            setDraft((s) => ({ ...s, morningAt: v }));
            setSaved(false);
          }}
        />
        <TimeRow
          icon="🌙"
          label="밤 알림"
          value={draft.nightAt}
          defaultTime="22:00"
          onChange={(v) => {
            setDraft((s) => ({ ...s, nightAt: v }));
            setSaved(false);
          }}
        />

        <div style={{ marginTop: "auto", paddingTop: 16 }}>
          {saved && !dirty && (
            <p style={{ textAlign: "center", fontSize: 12, color: "var(--color-brand-text)", marginBottom: 10 }}>
              저장됐어요 ✓
            </p>
          )}
          <PrimaryButton onClick={apply} disabled={!dirty || saving}>
            {saving ? "적용 중…" : "적용"}
          </PrimaryButton>
        </div>
      </div>
    </Screen>
  );
}

function TimeRow({
  icon,
  label,
  value,
  defaultTime,
  onChange,
}: {
  icon: string;
  label: string;
  value: string | null;
  defaultTime: string;
  onChange: (v: string | null) => void;
}) {
  const enabled = value !== null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: "var(--color-surface)",
        borderRadius: 16,
        padding: 14,
        boxShadow: "0 4px 14px rgba(60,70,110,0.07)",
        marginBottom: 10,
      }}
    >
      <span style={{ fontSize: 20 }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 500 }}>{label}</div>
        {enabled ? (
          <input
            type="time"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{
              marginTop: 4,
              border: "none",
              background: "var(--color-field)",
              borderRadius: 8,
              padding: "4px 8px",
              fontSize: 13,
              color: "var(--color-ink)",
            }}
          />
        ) : (
          <div style={{ fontSize: 12, color: "var(--color-ink-muted)", marginTop: 2 }}>꺼짐</div>
        )}
      </div>
      <button
        onClick={() => onChange(enabled ? null : defaultTime)}
        style={{
          width: 42,
          height: 24,
          borderRadius: 14,
          border: "none",
          background: enabled ? "var(--color-brand)" : "#d6dbe4",
          position: "relative",
          cursor: "pointer",
          flexShrink: 0,
        }}
        aria-label={`${label} 켜기/끄기`}
      >
        <span
          style={{
            position: "absolute",
            top: 3,
            left: enabled ? 21 : 3,
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: "#fff",
            transition: "left 0.15s",
          }}
        />
      </button>
    </div>
  );
}
