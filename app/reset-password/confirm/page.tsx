"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import { Screen, TopBar, PrimaryButton } from "@/components/ui";

function ResetPasswordConfirmContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { updatePassword } = useStore();

  const [ready, setReady] = useState(false);
  const [linkError, setLinkError] = useState(false);
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = params.get("code");
    if (!code) {
      setLinkError(true);
      return;
    }
    const supabase = createClient();
    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) setLinkError(true);
      else setReady(true);
    });
  }, [params]);

  async function submit() {
    if (password.length < 6) {
      setError("비밀번호는 6자 이상으로 입력해주세요.");
      return;
    }
    if (password !== password2) {
      setError("비밀번호가 서로 달라요.");
      return;
    }
    setError(null);
    setLoading(true);
    const ok = await updatePassword(password);
    setLoading(false);
    if (ok) router.replace("/");
    else setError("변경에 실패했어요. 링크가 만료됐을 수 있어요.");
  }

  return (
    <Screen>
      <TopBar title="비밀번호 재설정" />
      <div style={{ flex: 1, padding: "8px 20px 24px", display: "flex", flexDirection: "column" }}>
        {linkError ? (
          <div style={{ marginTop: 40, textAlign: "center" }}>
            <p style={{ fontSize: 15, fontWeight: 500, marginBottom: 8 }}>링크가 유효하지 않아요</p>
            <p style={{ fontSize: 13, color: "var(--color-ink-muted)", lineHeight: 1.6 }}>
              링크가 만료됐거나 이미 사용됐어요. 비밀번호 찾기를 다시 시도해주세요.
            </p>
          </div>
        ) : !ready ? (
          <p style={{ textAlign: "center", marginTop: 40, fontSize: 13, color: "var(--color-ink-muted)" }}>
            확인 중…
          </p>
        ) : (
          <>
            <p style={{ fontSize: 13, color: "var(--color-ink-muted)", margin: "8px 4px 20px", lineHeight: 1.5 }}>
              새 비밀번호를 입력해주세요.
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
                placeholder="새 비밀번호"
                style={fieldStyle}
              />
              <input
                type="password"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                placeholder="새 비밀번호 확인"
                style={{ ...fieldStyle, marginTop: 10 }}
              />
            </div>
            {error && (
              <p style={{ textAlign: "center", fontSize: 12, color: "#d14343", marginBottom: 12 }}>{error}</p>
            )}
            <PrimaryButton onClick={submit} disabled={loading || !password || !password2}>
              {loading ? "변경 중…" : "비밀번호 변경"}
            </PrimaryButton>
          </>
        )}
      </div>
    </Screen>
  );
}

export default function ResetPasswordConfirmPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordConfirmContent />
    </Suspense>
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
