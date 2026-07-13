"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Screen, TopBar, PrimaryButton } from "@/components/ui";

export default function ResetPasswordRequestPage() {
  const router = useRouter();
  const { requestPasswordReset } = useStore();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!email.trim()) return;
    setError(null);
    setLoading(true);
    const ok = await requestPasswordReset(email.trim());
    setLoading(false);
    if (ok) setSent(true);
    else setError("전송에 실패했어요. 이메일 주소를 확인해주세요.");
  }

  return (
    <Screen>
      <TopBar title="비밀번호 찾기" onBack={() => router.back()} />
      <div style={{ flex: 1, padding: "8px 20px 24px", display: "flex", flexDirection: "column" }}>
        {sent ? (
          <div style={{ marginTop: 40, textAlign: "center" }}>
            <p style={{ fontSize: 15, fontWeight: 500, marginBottom: 8 }}>이메일을 보냈어요</p>
            <p style={{ fontSize: 13, color: "var(--color-ink-muted)", lineHeight: 1.6 }}>
              {email} 주소로 비밀번호 재설정 링크를 보냈어요. 메일함을 확인해주세요.
            </p>
          </div>
        ) : (
          <>
            <p style={{ fontSize: 13, color: "var(--color-ink-muted)", margin: "8px 4px 20px", lineHeight: 1.5 }}>
              가입하신 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드려요.
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
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일"
                style={fieldStyle}
              />
            </div>
            {error && (
              <p style={{ textAlign: "center", fontSize: 12, color: "#d14343", marginBottom: 12 }}>{error}</p>
            )}
            <PrimaryButton onClick={submit} disabled={loading || !email.trim()}>
              {loading ? "보내는 중…" : "재설정 링크 보내기"}
            </PrimaryButton>
          </>
        )}
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
