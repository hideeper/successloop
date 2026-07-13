"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Screen, PrimaryButton } from "@/components/ui";

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

export default function ConsentPage() {
  const router = useRouter();
  const { user, hydrated, agreeToTerms, logout } = useStore();
  const [consents, setConsents] = useState<Consents>(initialConsents);
  const [loading, setLoading] = useState(false);

  if (hydrated && !user) {
    router.replace("/login");
    return null;
  }

  const requiredAgreed = consents.age14 && consents.terms && consents.privacy;

  function toggle(key: keyof Consents) {
    setConsents((c) => ({ ...c, [key]: !c[key] }));
  }

  async function agreeAllAndContinue() {
    setConsents({ age14: true, terms: true, privacy: true, marketing: true });
    await finish(true);
  }

  async function continueWithCurrent() {
    if (!requiredAgreed) return;
    await finish(consents.marketing);
  }

  async function finish(marketingOptIn: boolean) {
    setLoading(true);
    await agreeToTerms(marketingOptIn);
    setLoading(false);
    router.replace("/onboarding");
  }

  async function cancel() {
    await logout();
    router.replace("/login");
  }

  return (
    <Screen>
      <div style={{ flex: 1, padding: "24px 20px", display: "flex", flexDirection: "column" }}>
        <h1 style={{ fontSize: 21, fontWeight: 500, margin: "0 4px 8px" }}>약관에 동의해주세요</h1>
        <p style={{ fontSize: 13, color: "var(--color-ink-muted)", margin: "0 4px 20px" }}>
          {user?.email}로 로그인하셨어요. 서비스 이용을 위해 약관 동의가 필요해요.
        </p>

        <div
          style={{
            background: "var(--color-surface)",
            borderRadius: 16,
            padding: "2px 14px",
            boxShadow: "0 5px 18px rgba(60,70,110,0.08)",
          }}
        >
          <ConsentRow label="만 14세 이상입니다" checked={consents.age14} onToggle={() => toggle("age14")} />
          <ConsentRow label="서비스 이용약관 동의" checked={consents.terms} onToggle={() => toggle("terms")} />
          <ConsentRow
            label="개인정보 수집·이용 동의"
            checked={consents.privacy}
            onToggle={() => toggle("privacy")}
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

        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
          {requiredAgreed && !consents.marketing ? (
            <PrimaryButton onClick={continueWithCurrent} disabled={loading}>
              선택한 항목으로 계속
            </PrimaryButton>
          ) : null}
          <PrimaryButton onClick={agreeAllAndContinue} disabled={loading}>
            {loading ? "처리 중…" : "전체 동의하고 계속"}
          </PrimaryButton>
          <button onClick={cancel} style={textButton}>
            취소하고 로그아웃
          </button>
        </div>
      </div>
    </Screen>
  );
}

function ConsentRow({
  label,
  required = true,
  checked,
  onToggle,
  last = false,
}: {
  label: string;
  required?: boolean;
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

const textButton = {
  background: "none",
  border: "none",
  textAlign: "center" as const,
  fontSize: 13,
  color: "var(--color-ink-soft)",
  padding: "8px 0",
  cursor: "pointer",
};
