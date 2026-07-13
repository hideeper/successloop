"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Screen, TopBar } from "@/components/ui";

type Tab = "terms" | "privacy";

// 로그인 여부와 무관하게(가입 동의 화면에서도) 열람할 수 있어야 하므로 useAppGuard를 적용하지 않는다.
export default function TermsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("terms");

  return (
    <Screen>
      <TopBar title="이용약관 · 개인정보 처리방침" onBack={() => router.back()} />

      <div style={{ display: "flex", gap: 8, padding: "0 14px 8px" }}>
        <TabButton label="이용약관" active={tab === "terms"} onClick={() => setTab("terms")} />
        <TabButton label="개인정보 처리방침" active={tab === "privacy"} onClick={() => setTab("privacy")} />
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "8px 14px 24px" }}>
        <div
          style={{
            background: "var(--color-surface)",
            borderRadius: 16,
            padding: 18,
            boxShadow: "0 5px 18px rgba(60,70,110,0.08)",
            fontSize: 13,
            lineHeight: 1.7,
            color: "var(--color-ink-soft)",
          }}
        >
          {tab === "terms" ? <TermsBody /> : <PrivacyBody />}
        </div>
      </div>
    </Screen>
  );
}

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        fontSize: 13,
        fontWeight: 500,
        color: active ? "#fff" : "var(--color-brand-text)",
        background: active ? "var(--color-brand)" : "var(--color-brand-soft)",
        border: "none",
        borderRadius: 12,
        padding: "10px 0",
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}

function H({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--color-ink)", margin: "18px 0 8px" }}>{children}</h2>
  );
}

function P({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <p style={{ margin: "0 0 8px", ...style }}>{children}</p>;
}

function TermsBody() {
  return (
    <>
      <P>
        <strong style={{ color: "var(--color-ink)" }}>시행일: 2026년 7월 13일</strong>
        <br />
        본 약관은 SuccessLoop(이하 &quot;서비스&quot;)의 이용 조건 및 절차, 운영자와 이용자의 권리·의무 및
        책임사항을 규정합니다.
      </P>

      <H>제1조 (목적)</H>
      <P>
        이 약관은 서비스 운영자(이하 &quot;운영자&quot;)가 제공하는 SuccessLoop 서비스의 이용과 관련하여
        운영자와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 정함을 목적으로 합니다.
      </P>

      <H>제2조 (서비스의 내용)</H>
      <P>
        서비스는 이용자가 목표를 기록하고 매일 실행 여부를 관리할 수 있도록 지원하는 개인용 목표관리
        도구를 제공합니다. 운영자는 서비스의 내용을 사전 고지 후 변경하거나 중단할 수 있습니다.
      </P>

      <H>제3조 (회원가입 및 계정)</H>
      <P>
        이용자는 이메일과 비밀번호를 등록하여 계정을 생성합니다. 이용자는 자신의 계정 정보를 안전하게
        관리할 책임이 있으며, 계정 정보 유출로 발생한 불이익에 대해 운영자는 고의 또는 중과실이 없는 한
        책임을 지지 않습니다.
      </P>

      <H>제4조 (이용자의 의무)</H>
      <P>이용자는 다음 행위를 해서는 안 됩니다.</P>
      <P>
        1. 타인의 계정을 무단으로 사용하는 행위
        <br />
        2. 서비스의 운영을 고의로 방해하는 행위
        <br />
        3. 법령 또는 공서양속에 반하는 목적으로 서비스를 이용하는 행위
      </P>

      <H>제5조 (서비스 이용의 제한 및 중지)</H>
      <P>
        운영자는 이용자가 본 약관을 위반하거나 서비스의 정상적인 운영을 방해한 경우, 사전 통지 후 서비스
        이용을 제한하거나 계정을 정지할 수 있습니다.
      </P>

      <H>제6조 (면책조항)</H>
      <P>
        운영자는 천재지변, 서비스 제공에 필요한 외부 인프라(클라우드·인증 등)의 장애 등 운영자의
        귀책사유가 없는 사유로 서비스를 제공할 수 없는 경우 책임이 면제됩니다. 서비스는 개인의 목표
        관리를 돕는 도구이며, 이용자가 서비스를 통해 얻은 정보나 기록을 바탕으로 내린 결정에 대해
        운영자는 책임을 지지 않습니다.
      </P>

      <H>제7조 (약관의 변경)</H>
      <P>
        운영자는 필요한 경우 관련 법령을 위반하지 않는 범위에서 본 약관을 변경할 수 있으며, 변경 시
        서비스 내 공지를 통해 사전 고지합니다.
      </P>

      <H>제8조 (문의)</H>
      <P>약관에 대한 문의는 서비스 내 &quot;설정 → 문의하기&quot;를 통해 접수할 수 있습니다.</P>

      <P style={{ marginTop: 16, fontSize: 12, color: "var(--color-ink-muted)" }}>
        ※ 본 약관은 일반적인 서비스 이용약관 초안이며, 사업자 등록 여부·서비스 확대 범위에 맞춰 검토 후
        게시해주세요.
      </P>
    </>
  );
}

function PrivacyBody() {
  return (
    <>
      <P>
        <strong style={{ color: "var(--color-ink)" }}>시행일: 2026년 7월 13일</strong>
        <br />
        SuccessLoop(이하 &quot;서비스&quot;)는 이용자의 개인정보를 소중히 여기며, 「개인정보 보호법」 등
        관련 법령을 준수합니다.
      </P>

      <H>1. 수집하는 개인정보 항목</H>
      <P>
        - 필수: 이메일 주소, 비밀번호(암호화 저장)
        <br />
        - 선택: 목표·기록 등 서비스 이용 과정에서 이용자가 직접 입력하는 정보, 푸시 알림 구독 정보
        <br />
        - 자동 수집: 서비스 접속 및 이용 기록(최근 활동 일시)
      </P>

      <H>2. 개인정보의 수집 및 이용 목적</H>
      <P>
        - 회원 가입 및 본인 확인, 서비스 제공(목표·기록 저장, 알림 발송)
        <br />
        - 문의 접수 및 답변
        <br />
        - 서비스 개선을 위한 이용 통계 분석(집계·익명 처리된 형태)
      </P>

      <H>3. 개인정보의 보유 및 이용 기간</H>
      <P>
        회원 탈퇴 시 지체 없이 파기합니다. 단, 관련 법령에 따라 보존이 필요한 경우 해당 법령에서 정한
        기간 동안 보관합니다.
      </P>

      <H>4. 개인정보의 제3자 제공</H>
      <P>
        운영자는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만 법령에 근거하거나
        수사기관이 적법한 절차에 따라 요청하는 경우 예외로 합니다.
      </P>

      <H>5. 개인정보 처리 위탁</H>
      <P>
        서비스는 인증 및 데이터 저장을 위해 Supabase(클라우드 인프라)를, 푸시 알림 발송을 위해 웹 푸시
        서비스를 이용합니다. 위탁받은 업체는 위탁 목적 범위 내에서만 개인정보를 처리합니다.
      </P>

      <H>6. 이용자의 권리</H>
      <P>
        이용자는 언제든지 자신의 개인정보를 조회·수정할 수 있으며, 설정 내 &quot;데이터
        내보내기&quot;를 통해 본인 데이터를 다운로드하거나 &quot;회원 탈퇴&quot;를 통해 삭제를 요청할 수
        있습니다.
      </P>

      <H>7. 개인정보의 안전성 확보 조치</H>
      <P>
        비밀번호는 암호화하여 저장하며, 이용자별 데이터는 접근 권한이 분리된 데이터베이스 정책(RLS)을
        통해 본인만 조회할 수 있도록 관리합니다.
      </P>

      <H>8. 문의처</H>
      <P>개인정보 관련 문의는 서비스 내 &quot;설정 → 문의하기&quot;를 통해 접수할 수 있습니다.</P>

      <P style={{ marginTop: 16, fontSize: 12, color: "var(--color-ink-muted)" }}>
        ※ 본 처리방침은 일반적인 초안이며, 실제 운영자 정보(사업자명·연락처)와 수집 항목 변경 사항을
        반영해 검토 후 게시해주세요.
      </P>
    </>
  );
}
