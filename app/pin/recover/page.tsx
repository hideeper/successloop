"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import { Screen, TopBar, PrimaryButton } from "@/components/ui";

// PIN 분실 복구: 새 PIN을 설정하기 전에 반드시 비밀번호로 본인 확인을 거친다.
// (예전엔 이 화면 없이 곧장 /pin/setup으로 갈 수 있어서, 기기를 주운 사람이 비밀번호 없이
// 새 PIN을 마음대로 설정하고 들어올 수 있는 구멍이었다.)
export default function PinRecoverPage() {
  const router = useRouter();
  const { hydrated, user, unlock } = useStore();
  const [provider, setProvider] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    if (!user) router.replace("/login");
  }, [hydrated, user, router]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setProvider(data.user?.app_metadata?.provider ?? null);
    });
  }, []);

  async function verify() {
    if (!user?.email || !password) return;
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email: user.email, password });
    setLoading(false);
    if (error) {
      setError("비밀번호가 올바르지 않아요.");
      return;
    }
    unlock();
    router.replace("/pin/setup");
  }

  if (!hydrated || provider === null) {
    return (
      <Screen>
        <TopBar title="PIN 재설정" />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p style={{ fontSize: 13, color: "var(--color-ink-muted)" }}>확인 중…</p>
        </div>
      </Screen>
    );
  }

  if (provider !== "email") {
    return (
      <Screen>
        <TopBar title="PIN 재설정" onBack={() => router.back()} />
        <div style={{ flex: 1, padding: "8px 20px 24px" }}>
          <p
            style={{
              fontSize: 13,
              color: "var(--color-ink-muted)",
              lineHeight: 1.6,
              marginTop: 40,
              textAlign: "center",
            }}
          >
            소셜 로그인 계정은 본인 확인 방법이 달라요.
            <br />
            문의하기로 알려주시면 도와드릴게요.
          </p>
          <div style={{ marginTop: 24 }}>
            <Link
              href="/settings/inquiry"
              style={{
                display: "block",
                textAlign: "center",
                fontSize: 13,
                color: "var(--color-brand-text)",
                fontWeight: 500,
              }}
            >
              문의하기로 이동
            </Link>
          </div>
        </div>
      </Screen>
    );
  }

  return (
    <Screen>
      <TopBar title="PIN 재설정" onBack={() => router.back()} />
      <div style={{ flex: 1, padding: "8px 20px 24px", display: "flex", flexDirection: "column" }}>
        <p style={{ fontSize: 13, color: "var(--color-ink-muted)", margin: "8px 4px 20px", lineHeight: 1.5 }}>
          본인 확인을 위해 계정 비밀번호를 입력해주세요.
        </p>
        <div
          style={{
            background: "var(--color-surface)",
            borderRadius: 18,
            padding: 16,
            boxShadow: "0 6px 20px rgba(60,70,110,0.08)",
            marginBottom: 16,
          }}
        >
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            style={fieldStyle}
          />
        </div>
        {error && (
          <p style={{ textAlign: "center", fontSize: 12, color: "#d14343", marginBottom: 12 }}>{error}</p>
        )}
        <PrimaryButton onClick={verify} disabled={loading || !password}>
          {loading ? "확인 중…" : "확인"}
        </PrimaryButton>
      </div>
    </Screen>
  );
}

const fieldStyle = {
  width: "100%",
  height: 46,
  background: "var(--color-field)",
  border: "none",
  borderRadius: 12,
  padding: "0 14px",
  fontSize: 14,
  color: "var(--color-ink)",
} as const;
