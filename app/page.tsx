"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { Screen, PrimaryButton, PhotoBox } from "@/components/ui";

export default function Home() {
  const router = useRouter();
  const { hydrated, user, termsAgreed, stage1Done, hasPin, unlocked } = useStore();

  // 로그인된 사용자는 각자 단계에 맞는 화면으로 자동 이동. 비로그인 사용자는 아래 랜딩을 본다.
  useEffect(() => {
    if (!hydrated || !user) return;
    if (!termsAgreed) router.replace("/consent");
    else if (!stage1Done) router.replace("/onboarding");
    else if (hasPin && !unlocked) router.replace("/pin/lock");
    else router.replace("/today");
  }, [hydrated, user, termsAgreed, stage1Done, hasPin, unlocked, router]);

  if (!hydrated || user) {
    return (
      <main
        style={{
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--color-ink-muted)",
        }}
      >
        불러오는 중…
      </main>
    );
  }

  return <Landing />;
}

function Landing() {
  const router = useRouter();

  return (
    <Screen>
      <div style={{ flex: 1, padding: "28px 20px 40px", display: "flex", flexDirection: "column" }}>
        <div style={{ textAlign: "center", marginBottom: 22 }}>
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
          <div style={{ fontSize: 15, fontWeight: 500, color: "var(--color-brand-text)" }}>SuccessLoop</div>
        </div>

        <PhotoBox label="빛의 터널 끝 실루엣" height={200} radius={18} />

        <h1
          style={{
            fontSize: 24,
            fontWeight: 600,
            lineHeight: 1.4,
            textAlign: "center",
            margin: "22px 4px 10px",
            whiteSpace: "pre-line",
          }}
        >
          {"목표를 적으면\n뇌가 스스로 답을 찾습니다"}
        </h1>
        <p
          style={{
            fontSize: 14,
            color: "var(--color-ink-muted)",
            textAlign: "center",
            lineHeight: 1.6,
            margin: "0 4px 26px",
          }}
        >
          올바른 목표를 적고 매일 반복해서 떠올리면, 목표가 잠재의식에 각인되어 의식하지 못할 때도 뇌가 답을
          찾아 나섭니다.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 30 }}>
          <PrimaryButton onClick={() => router.push("/signup")}>무료로 시작하기</PrimaryButton>
          <button onClick={() => router.push("/login")} style={loginTextButton}>
            이미 계정이 있어요 · 로그인
          </button>
        </div>

        <FeatureCard
          title="뇌는 스스로 답을 찾습니다"
          body="목표를 명확히 정의하면, 망상활성계(RAS)가 의식하지 못할 때도 정보를 모으고 답을 찾습니다."
        />
        <FeatureCard
          title="반복이 만드는 각인"
          body="아침·일상 중·밤, 하루 여러 번의 리마인드로 목표를 잠재의식에 반복해서 새깁니다."
        />
        <FeatureCard
          title="진짜 목표부터 찾기"
          body="하기 싫은 일과 하고 싶은 일을 정리하면, 남이 아닌 내가 진짜 원하는 방향이 보입니다."
        />
        <FeatureCard
          title="매일의 작은 실행"
          body="큰 목표에 짓눌리지 않도록, 오늘 할 수 있는 작은 SMART 목표 하나로 좌절 없이 이어갑니다."
          last
        />

        <div style={{ marginTop: 26 }}>
          <PrimaryButton onClick={() => router.push("/signup")}>지금 목표 적어보기</PrimaryButton>
        </div>

        <div style={{ textAlign: "center", marginTop: 18 }}>
          <Link
            href="/settings/terms"
            style={{ fontSize: 12, color: "var(--color-ink-muted)", textDecoration: "none" }}
          >
            이용약관 · 개인정보 처리방침
          </Link>
        </div>
      </div>
    </Screen>
  );
}

function FeatureCard({ title, body, last = false }: { title: string; body: string; last?: boolean }) {
  return (
    <div
      style={{
        background: "var(--color-surface)",
        borderRadius: 16,
        padding: 16,
        boxShadow: "0 4px 14px rgba(60,70,110,0.07)",
        marginBottom: last ? 0 : 10,
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13, color: "var(--color-ink-soft)", lineHeight: 1.55 }}>{body}</div>
    </div>
  );
}

const loginTextButton = {
  background: "none",
  border: "none",
  textAlign: "center" as const,
  fontSize: 13,
  color: "var(--color-ink-soft)",
  padding: "6px 0",
  cursor: "pointer",
};
