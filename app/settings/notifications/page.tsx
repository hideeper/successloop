"use client";

import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { useAppGuard } from "@/lib/useAppGuard";
import { Screen, TopBar } from "@/components/ui";

export default function NotificationTimesPage() {
  const router = useRouter();
  const { reminderSettings, setReminderSettings } = useStore();
  useAppGuard();

  return (
    <Screen>
      <TopBar title="알림 시간 설정" onBack={() => router.replace("/settings")} />

      <div style={{ flex: 1, padding: "8px 14px 20px" }}>
        <p style={{ fontSize: 12, color: "var(--color-ink-muted)", margin: "0 4px 16px", lineHeight: 1.5 }}>
          설정한 시각에 실현 목록을 읽으라는 알림을 보내드려요. (한국시간 기준)
        </p>

        <TimeRow
          icon="🌅"
          label="아침 알림"
          value={reminderSettings.morningAt}
          defaultTime="07:00"
          onChange={(v) => setReminderSettings({ morningAt: v })}
        />
        <TimeRow
          icon="🌙"
          label="밤 알림"
          value={reminderSettings.nightAt}
          defaultTime="22:00"
          onChange={(v) => setReminderSettings({ nightAt: v })}
        />
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
