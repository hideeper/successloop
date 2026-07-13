"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { useAppGuard } from "@/lib/useAppGuard";
import { useTheme } from "@/lib/theme";
import { Screen, BottomNav } from "@/components/ui";
import { getNotificationPermission, sendTestPush, subscribeToPush } from "@/lib/pushClient";
import { createClient } from "@/lib/supabase/client";
import { buildExportCsv, downloadCsv } from "@/lib/export";

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout, userId, roadmap } = useStore();
  const { theme, toggle: toggleTheme } = useTheme();
  const [exporting, setExporting] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  useAppGuard();

  async function doLogout() {
    await logout();
    router.replace("/login");
  }

  async function withdraw() {
    if (!confirm("정말 탈퇴하시겠어요? 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.")) return;
    setWithdrawing(true);
    const res = await fetch("/api/account/delete", { method: "POST" });
    if (res.ok) {
      await logout();
      router.replace("/login");
    } else {
      setWithdrawing(false);
      alert("탈퇴 처리 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.");
    }
  }

  async function handleExport() {
    if (!userId || exporting) return;
    setExporting(true);
    try {
      const supabase = createClient();
      const csv = await buildExportCsv(supabase, userId, roadmap);
      downloadCsv(`successloop_${new Date().toISOString().slice(0, 10)}.csv`, csv);
    } finally {
      setExporting(false);
    }
  }

  return (
    <Screen>
      <div style={{ flex: 1, padding: "18px 14px" }}>
        <div style={{ fontSize: 18, fontWeight: 500, padding: "0 4px", marginBottom: 14 }}>설정</div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: "var(--color-surface)",
            borderRadius: 16,
            padding: 14,
            boxShadow: "0 4px 14px rgba(60,70,110,0.07)",
            marginBottom: 14,
          }}
        >
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: "50%",
              background: "var(--color-brand-soft)",
              color: "var(--color-brand)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
            }}
          >
            👤
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 500 }}>{user?.email ?? "게스트"}</div>
            <div style={{ fontSize: 12, color: "var(--color-ink-muted)" }}>계정 정보</div>
          </div>
        </div>

        <Card>
          <Row label="PIN 변경" href="/pin/setup" />
        </Card>

        <NotificationCard />

        <Card>
          <ToggleRow label="다크 모드" checked={theme === "dark"} onToggle={toggleTheme} />
          <Row
            label={exporting ? "내보내는 중…" : "데이터 내보내기 (CSV·Excel)"}
            onClick={handleExport}
            disabled={exporting}
          />
          <Row label="문의하기" href="/settings/inquiry" />
          <Row label="이용약관 · 개인정보 처리방침" href="/settings/terms" last />
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: 4, padding: "4px 4px 0" }}>
          <button onClick={doLogout} style={textButton("var(--color-ink-soft)")}>
            로그아웃
          </button>
          <button onClick={withdraw} disabled={withdrawing} style={textButton("#d14343")}>
            {withdrawing ? "탈퇴 처리 중…" : "회원 탈퇴"}
          </button>
        </div>
      </div>

      <BottomNav active="settings" />
    </Screen>
  );
}

function NotificationCard() {
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setPermission(getNotificationPermission());
  }, []);

  async function handleEnable() {
    setLoading(true);
    setMessage(null);
    const res = await subscribeToPush();
    setLoading(false);
    setPermission(getNotificationPermission());
    setMessage(res.ok ? "알림이 켜졌어요. '시간 설정'에서 원하는 시각으로 바꿀 수 있어요." : res.error ?? "실패했어요.");
  }

  async function handleTest() {
    setLoading(true);
    setMessage(null);
    const res = await sendTestPush();
    setLoading(false);
    setMessage(res.ok ? "테스트 알림을 보냈어요. 잠시 후 확인해보세요." : (res.error ?? "발송 실패"));
  }

  const enabled = permission === "granted";

  return (
    <div
      style={{
        background: "var(--color-surface)",
        borderRadius: 16,
        boxShadow: "0 4px 14px rgba(60,70,110,0.07)",
        padding: 14,
        marginBottom: 14,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: message ? 10 : 0 }}>
        <span style={{ flex: 1, fontSize: 14, color: "var(--color-ink)" }}>알림 설정</span>
        {permission === "unsupported" ? (
          <span style={{ fontSize: 12, color: "var(--color-ink-muted)" }}>미지원 브라우저</span>
        ) : enabled ? (
          <div style={{ display: "flex", gap: 8 }}>
            <Link
              href="/settings/notifications"
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: "var(--color-ink-soft)",
                border: "1px solid var(--color-line)",
                borderRadius: 14,
                padding: "5px 12px",
                textDecoration: "none",
              }}
            >
              시간 설정
            </Link>
            <button
              onClick={handleTest}
              disabled={loading}
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: "var(--color-brand-text)",
                border: "1px solid var(--color-brand-border)",
                borderRadius: 14,
                padding: "5px 12px",
                background: "none",
                cursor: "pointer",
              }}
            >
              테스트 발송
            </button>
          </div>
        ) : (
          <button
            onClick={handleEnable}
            disabled={loading || permission === "denied"}
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: "#fff",
              border: "none",
              borderRadius: 14,
              padding: "6px 14px",
              background: permission === "denied" ? "#c3cad6" : "var(--color-brand)",
              cursor: permission === "denied" ? "default" : "pointer",
            }}
          >
            {permission === "denied" ? "권한 차단됨" : "알림 켜기"}
          </button>
        )}
      </div>
      {message && <div style={{ fontSize: 12, color: "var(--color-ink-muted)", lineHeight: 1.5 }}>{message}</div>}
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "var(--color-surface)",
        borderRadius: 16,
        boxShadow: "0 4px 14px rgba(60,70,110,0.07)",
        padding: "2px 14px",
        marginBottom: 14,
      }}
    >
      {children}
    </div>
  );
}

function Row({
  label,
  href,
  onClick,
  soon = false,
  disabled = false,
  last = false,
}: {
  label: string;
  href?: string;
  onClick?: () => void;
  soon?: boolean;
  disabled?: boolean;
  last?: boolean;
}) {
  const router = useRouter();
  const clickable = !soon && !disabled && (href || onClick);
  return (
    <div
      onClick={() => {
        if (!clickable) return;
        if (onClick) onClick();
        else if (href) router.push(href);
      }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "13px 0",
        borderBottom: last ? "none" : "1px solid #f1f3f7",
        cursor: clickable ? "pointer" : "default",
      }}
    >
      <span style={{ flex: 1, fontSize: 14, color: soon || disabled ? "var(--color-ink-muted)" : "var(--color-ink)" }}>
        {label}
      </span>
      {soon ? (
        <span style={{ fontSize: 11, color: "var(--color-ink-muted)", background: "var(--color-field)", borderRadius: 12, padding: "3px 9px" }}>
          준비 중
        </span>
      ) : !disabled ? (
        <span style={{ color: "#c3cad6", fontSize: 18 }}>›</span>
      ) : null}
    </div>
  );
}

function ToggleRow({ label, checked, onToggle }: { label: string; checked: boolean; onToggle: () => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 0", borderBottom: "1px solid #f1f3f7" }}>
      <span style={{ flex: 1, fontSize: 14, color: "var(--color-ink)" }}>{label}</span>
      <button
        onClick={onToggle}
        aria-pressed={checked}
        style={{
          width: 44,
          height: 26,
          borderRadius: 13,
          border: "none",
          background: checked ? "var(--color-brand)" : "var(--color-line)",
          position: "relative",
          cursor: "pointer",
          flexShrink: 0,
          padding: 0,
          transition: "background 0.15s",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 3,
            left: checked ? 21 : 3,
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: "#fff",
            transition: "left 0.15s",
            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
          }}
        />
      </button>
    </div>
  );
}

function textButton(color: string) {
  return {
    background: "none",
    border: "none",
    textAlign: "left" as const,
    fontSize: 13,
    color,
    padding: "8px 0",
    cursor: "pointer",
  };
}
