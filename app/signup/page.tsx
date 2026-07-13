"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Screen, TopBar, PrimaryButton } from "@/components/ui";

type Consents = {
  age14: boolean;
  terms: boolean;
  privacy: boolean;
  marketing: boolean;
};

const initialConsents: Consents = {
  age14: false,
  terms: false,
  privacy: false,
  marketing: false,
};

export default function SignupPage() {
  const router = useRouter();
  const { signUp } = useStore();
  const [step, setStep] = useState<"info" | "consent">("info");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [consents, setConsents] = useState<Consents>(initialConsents);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canGoConsent = email.trim().length > 0 && password.length >= 6;
  const requiredAgreed = consents.age14 && consents.terms && consents.privacy;

  function toggle(key: keyof Consents) {
    setConsents((c) => ({ ...c, [key]: !c[key] }));
  }

  function agreeAllAndContinue() {
    setConsents({ age14: true, terms: true, privacy: true, marketing: true });
    finish(true);
  }

  function continueWithCurrent() {
    if (!requiredAgreed) return;
    finish(consents.marketing);
  }

  async function finish(marketingOptIn: boolean) {
    setError(null);
    setLoading(true);
    const ok = await signUp(email.trim(), password, marketingOptIn);
    setLoading(false);
    if (ok) router.replace("/onboarding");
    else setError("가입에 실패했습니다. 이미 가입된 이메일이거나 비밀번호가 너무 짧을 수 있어요.");
  }

  if (step === "info") {
    return (
      <Screen>
        <TopBar title="회원가입" onBack={() => router.back()} />
        <div style={{ flex: 1, padding: "8px 20px 24px", display: "flex", flexDirection: "column" }}>
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
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호"
              style={{ ...fieldStyle, marginTop: 10 }}
            />
          </div>
          <p style={{ fontSize: 12, color: "var(--color-ink-muted)", marginBottom: 20 }}>
            비밀번호는 6자 이상으로 입력해주세요.
          </p>
          <div style={{ marginTop: "auto" }}>
            <PrimaryButton onClick={() => setStep("consent")} disabled={!canGoConsent}>
              다음
            </PrimaryButton>
          </div>
        </div>
      </Screen>
    );
  }

  return (
    <Screen>
      <TopBar title="" onBack={() => setStep("info")} />
      <div style={{ flex: 1, padding: "0 20px 24px", display: "flex", flexDirection: "column" }}>
        <h1 style={{ fontSize: 21, fontWeight: 500, margin: "0 4px 8px" }}>약관에 동의해주세요</h1>
        <p style={{ fontSize: 13, color: "var(--color-ink-muted)", margin: "0 4px 20px" }}>
          한 번에 동의하거나 항목별로 선택할 수 있어요.
        </p>

        <div
          style={{
            background: "var(--color-surface)",
            borderRadius: 16,
            padding: "2px 14px",
            boxShadow: "0 5px 18px rgba(60,70,110,0.08)",
          }}
        >
          <ConsentRow label="만 14세 이상입니다" required checked={consents.age14} onToggle={() => toggle("age14")} />
          <ConsentRow label="서비스 이용약관 동의" required checked={consents.terms} onToggle={() => toggle("terms")} />
          <ConsentRow
            label="개인정보 수집·이용 동의"
            required
            checked={consents.privacy}
            onToggle={() => toggle("privacy")}
            last
          />
          <ConsentRow
            label="마케팅 정보 수신 (이메일·푸시)"
            required={false}
            checked={consents.marketing}
            onToggle={() => toggle("marketing")}
            last
          />
        </div>

        <a
          href="/settings/terms"
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: "block", fontSize: 12, color: "var(--color-ink-muted)", margin: "14px 4px 0" }}
        >
          이용약관 · 개인정보 처리방침 보기
        </a>

        {error && (
          <p style={{ textAlign: "center", fontSize: 12, color: "#d14343", margin: "14px 4px 0" }}>{error}</p>
        )}

        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
          {requiredAgreed && !consents.marketing ? (
            <PrimaryButton onClick={continueWithCurrent} disabled={loading}>
              선택한 항목으로 계속
            </PrimaryButton>
          ) : null}
          <PrimaryButton onClick={agreeAllAndContinue} disabled={loading}>
            {loading ? "가입 처리 중…" : "전체 동의하고 계속"}
          </PrimaryButton>
        </div>
      </div>
    </Screen>
  );
}

function ConsentRow({
  label,
  required,
  checked,
  onToggle,
  last = false,
}: {
  label: string;
  required: boolean;
  checked: boolean;
  onToggle: () => void;
  last?: boolean;
}) {
  return (
    <div
      onClick={onToggle}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 11,
        padding: "13px 0",
        borderBottom: last ? "none" : "1px solid #f1f3f7",
        cursor: "pointer",
      }}
    >
      <span
        style={{
          width: 20,
          height: 20,
          borderRadius: "50%",
          border: checked ? "none" : "1px solid #c3cad6",
          background: checked ? "var(--color-brand)" : "transparent",
          color: "#fff",
          fontSize: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {checked ? "✓" : ""}
      </span>
      <span style={{ flex: 1, fontSize: 14, color: "var(--color-ink)" }}>
        <span style={{ color: required ? "var(--color-brand)" : "var(--color-ink-muted)" }}>
          [{required ? "필수" : "선택"}]
        </span>{" "}
        {label}
      </span>
    </div>
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
