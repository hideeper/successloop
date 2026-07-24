"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { Screen, PrimaryButton } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signInWithProvider } = useStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function go() {
    setError(null);
    if (!email.trim() || !password) {
      setError("이메일과 비밀번호를 입력해주세요.");
      return;
    }
    setLoading(true);
    const ok = await signIn(email.trim(), password);
    setLoading(false);
    if (ok) router.replace("/"); // 가드가 단계에 맞춰 알아서 이동시킴
    else setError("로그인에 실패했습니다. 이메일/비밀번호를 확인해주세요.");
  }

  function socialLogin(provider: "google" | "kakao") {
    setError(null);
    signInWithProvider(provider);
  }

  function socialComingSoon() {
    setError("소셜 로그인은 준비 중입니다. 이메일로 가입해주세요.");
  }

  return (
    <Screen>
      <div
        style={{
          position: "relative",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          backgroundImage: "url(/login/hero.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(10,10,20,0.45) 0%, rgba(10,10,20,0.2) 35%, rgba(10,10,20,0.85) 100%)",
          }}
        />

        <div style={{ position: "relative", padding: "44px 20px 0", textAlign: "center" }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 15,
              background: "var(--color-brand)",
              color: "#fff",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
              marginBottom: 12,
            }}
          >
            ↻
          </div>
          <div style={{ fontSize: 21, fontWeight: 500, color: "#fff" }}>SuccessLoop</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", marginTop: 5 }}>
            나의 진정한 목표를 매일 달성한다.
          </div>
        </div>

        <div
          style={{
            position: "relative",
            marginTop: "auto",
            background: "var(--color-surface)",
            borderRadius: "24px 24px 0 0",
            padding: "24px 20px 28px",
            boxShadow: "0 -8px 30px rgba(0,0,0,0.15)",
          }}
        >
          <div
            style={{
              background: "var(--color-field)",
              borderRadius: 18,
              padding: 16,
              marginBottom: 16,
            }}
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일"
              style={fieldStyle}
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호"
              style={{ ...fieldStyle, marginTop: 10, marginBottom: 14, background: "var(--color-surface)" }}
            />
            <PrimaryButton onClick={go} disabled={loading}>
              {loading ? "로그인 중…" : "로그인"}
            </PrimaryButton>
          </div>

          {error && (
            <p style={{ textAlign: "center", fontSize: 12, color: "#d14343", marginBottom: 12 }}>{error}</p>
          )}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 14,
              fontSize: 13,
              color: "var(--color-ink-soft)",
              marginBottom: 16,
            }}
          >
            <Link href="/signup" style={{ color: "var(--color-brand-text)", fontWeight: 500, textDecoration: "none" }}>
              회원가입
            </Link>
            <span style={{ color: "var(--color-line)" }}>|</span>
            <Link href="/reset-password/request" style={{ color: "var(--color-ink-soft)", textDecoration: "none" }}>
              비밀번호 찾기
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button onClick={() => socialLogin("kakao")} style={social("#fee500", "#3c1e1e")}>
              카카오로 계속하기
            </button>
            <button onClick={() => socialLogin("google")} style={social("#ffffff", "#1a1a2e", true)}>
              Google로 계속하기
            </button>
            <button onClick={socialComingSoon} style={social("#1a1a2e", "#ffffff")}>
              Apple로 계속하기
            </button>
          </div>

          <p
            style={{
              textAlign: "center",
              fontSize: 12,
              color: "var(--color-ink-muted)",
              marginTop: 18,
            }}
          >
            Apple 로그인은 준비 중입니다.
          </p>
        </div>
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

function social(bg: string, color: string, border = false) {
  return {
    width: "100%",
    background: bg,
    color,
    border: border ? "1px solid var(--color-line)" : "none",
    borderRadius: "var(--radius-pill)",
    padding: "13px",
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
  } as const;
}
