"use client";

import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { useAppGuard } from "@/lib/useAppGuard";
import { Screen, BottomNav } from "@/components/ui";

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout } = useStore();
  useAppGuard();

  async function doLogout() {
    await logout();
    router.replace("/login");
  }

  async function withdraw() {
    if (confirm("정말 탈퇴하시겠어요? 모든 데이터가 삭제됩니다.")) {
      await logout();
      router.replace("/login");
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

        <Card>
          <Row label="알림 설정" soon />
          <Row label="다크 모드" soon />
          <Row label="데이터 내보내기 (CSV·Excel)" soon />
          <Row label="문의하기" soon />
          <Row label="이용약관 · 개인정보 처리방침" soon last />
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: 4, padding: "4px 4px 0" }}>
          <button onClick={doLogout} style={textButton("var(--color-ink-soft)")}>
            로그아웃
          </button>
          <button onClick={withdraw} style={textButton("#d14343")}>
            회원 탈퇴
          </button>
        </div>
      </div>

      <BottomNav active="settings" />
    </Screen>
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

function Row({ label, href, soon = false, last = false }: { label: string; href?: string; soon?: boolean; last?: boolean }) {
  const router = useRouter();
  return (
    <div
      onClick={() => href && !soon && router.push(href)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "13px 0",
        borderBottom: last ? "none" : "1px solid #f1f3f7",
        cursor: soon ? "default" : "pointer",
      }}
    >
      <span style={{ flex: 1, fontSize: 14, color: soon ? "var(--color-ink-muted)" : "var(--color-ink)" }}>{label}</span>
      {soon ? (
        <span style={{ fontSize: 11, color: "var(--color-ink-muted)", background: "var(--color-field)", borderRadius: 12, padding: "3px 9px" }}>
          준비 중
        </span>
      ) : (
        <span style={{ color: "#c3cad6", fontSize: 18 }}>›</span>
      )}
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
