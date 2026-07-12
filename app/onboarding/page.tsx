"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Screen, PrimaryButton, PhotoBox } from "@/components/ui";

type ListField = "dislikes" | "likes" | "realizations";

type Step =
  | { kind: "card"; title: string; body: string[]; photo: string; cta: string }
  | {
      kind: "list";
      field: ListField;
      title: string;
      guide: string;
      examples: string[];
      cta: string;
    }
  | { kind: "text"; title: string; guide: string; examples: string[]; cta: string };

const steps: Step[] = [
  {
    kind: "card",
    photo: "노트에 적는 손",
    title: "성공하는 방법은\n아주 간단합니다",
    body: [
      "목표를 적으세요. 목표를 적으면 그대로 실현됩니다.",
      "여기에 진리가 숨겨져 있습니다.",
      "다시 한 번 말하면, 목표를 적으면 성공합니다.",
    ],
    cta: "다음",
  },
  {
    kind: "card",
    photo: "THIS FEELS SO REAL",
    title: "진짜 목표는\n길이 자연스럽게 열립니다",
    body: [
      "진짜 목표는 이루는 과정이 자연스럽게 흘러가지만, 가짜 목표는 자꾸 막힙니다. 중요한 건 내가 정말 하고 싶은 일을 정의하는 것이 먼저입니다.",
    ],
    cta: "다음",
  },
  {
    kind: "card",
    photo: "OUT",
    title: "하고 싶은 일은\n하기 싫은 일에서 보입니다",
    body: [
      "역설적이지만, 하기 싫은 일을 솔직하게 적다 보면 진짜 원하는 게 또렷해집니다. 한계나 제약 없이 떠오르는 그대로 적어보세요.",
    ],
    cta: "하기 싫은 일 적기",
  },
  {
    kind: "list",
    field: "dislikes",
    title: "하기 싫은 일",
    guide: "직관적으로 떠오르는 모든 하기 싫은 일을 적어보세요.",
    examples: [
      "브랜드 방향성과 맞지 않는 협업",
      "수익모델에 대한 무료 서비스",
      "시공간에 제약이 있는 업무 환경",
      "여유로운 여가를 누리지 못하는 것",
    ],
    cta: "다음",
  },
  {
    kind: "card",
    photo: "노을 들판의 아이",
    title: "지금은 '내가'\n하고 싶은 일에 집중",
    body: [
      "하기 싫은 일에도 해야 할 일이 있고, 둘이 충돌할 수도 있습니다. 그래도 지금은 정말 '내가' 하고 싶은 일을 또렷하게 하는 데 집중하세요.",
    ],
    cta: "하고 싶은 일 적기",
  },
  {
    kind: "list",
    field: "likes",
    title: "하고 싶은 일",
    guide: "직관적으로 떠오르는 모든 하고 싶은 일을 적어보세요.",
    examples: [
      "채무 없이 자연에 가까운 사옥 마련",
      "주기적인 파인다이닝 식사",
      "연주회·전시회 등 예술 경험",
      "브랜드의 성장과 성숙",
      "글로벌 브랜드로 확장",
    ],
    cta: "다음",
  },
  {
    kind: "card",
    photo: "별밤 아래 나침반",
    title: "방향성은\n인생의 나침반이 됩니다",
    body: [
      "싫음과 좋음을 정리하면 내 삶의 방향이 보입니다. 그 방향을 분명히 하면, 잠재의식을 깨워 내 길로 인도하는 나침반이 됩니다.",
    ],
    cta: "나침반 작성하기",
  },
  {
    kind: "text",
    title: "인생의 나침반",
    guide:
      "과거 성장 과정·경험을 되살려, 이생에서 무엇을 이루고 싶은지 생각해보세요. 언제든지 변경 가능하니 너무 깊게 고민하지 말고 떠오르는 생각을 적으세요.",
    examples: [
      "인문·사회·심리·철학·뇌과학의 융복합을 기반으로 독자적인 브랜드를 만든다. 고객의 삶이 변화되는 경험이 쌓여 선순환 구조를 만들고 글로벌 브랜드로 확장한다.",
    ],
    cta: "다음",
  },
  {
    kind: "card",
    photo: "빛의 터널 끝 실루엣",
    title: "뇌는 스스로\n답을 찾습니다",
    body: [
      "목표를 명확히 정의하면, 망상활성계가 의식하지 못할 때도 정보를 모으고 답을 찾습니다. 목표는 많을수록 좋습니다.",
    ],
    cta: "실현 목록 작성하기",
  },
  {
    kind: "list",
    field: "realizations",
    title: "실현 목록",
    guide: "개수에 상관없이 실현할 목표를 현재형으로 작성합니다.",
    examples: [
      "고정 고객이 70% 이상 유지된다.",
      "사업 수익을 통한 경제적 자유 상태가 된다.",
      "나와 뜻이 맞는 사업 파트너를 만난다.",
      "지속 성장 중심의 사업 커뮤니티에 속한다.",
    ],
    cta: "1단계 완료",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { roadmap, setRoadmap, completeStage1, hasPin, logout } = useStore();
  const [i, setI] = useState(0);
  const [input, setInput] = useState("");
  const [showExamples, setShowExamples] = useState(false);

  const step = steps[i];
  const last = i === steps.length - 1;

  function next() {
    setInput("");
    setShowExamples(false);
    if (last) {
      completeStage1();
      router.replace(hasPin ? "/today" : "/pin/setup");
    } else {
      setI((v) => v + 1);
    }
  }

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  function back() {
    setShowExamples(false);
    if (i > 0) setI((v) => v - 1);
  }

  function addItem(field: ListField) {
    const v = input.trim();
    if (!v) return;
    setRoadmap({ [field]: [...roadmap[field], v] });
    setInput("");
  }

  function removeItem(field: ListField, idx: number) {
    setRoadmap({ [field]: roadmap[field].filter((_, k) => k !== idx) });
  }

  return (
    <Screen>
      <div style={{ padding: "14px 16px 0", display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={handleLogout}
          style={{
            background: "none",
            border: "none",
            fontSize: 12,
            color: "var(--color-ink-muted)",
            cursor: "pointer",
            padding: 4,
          }}
        >
          로그아웃
        </button>
      </div>

      <div style={{ padding: "6px 16px 6px", display: "flex", gap: 6 }}>
        {steps.map((_, k) => (
          <div
            key={k}
            style={{
              flex: 1,
              height: 5,
              borderRadius: 3,
              background: k <= i ? "var(--color-brand)" : "#d6dbe4",
            }}
          />
        ))}
      </div>

      <div style={{ flex: 1, padding: "8px 16px 20px", display: "flex", flexDirection: "column" }}>
        {step.kind === "card" && (
          <div
            style={{
              flex: 1,
              background: "var(--color-surface)",
              borderRadius: "var(--radius-card)",
              boxShadow: "0 8px 26px rgba(60,70,110,0.10)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <PhotoBox label={step.photo} height={200} />
            <div style={{ padding: "20px 18px", display: "flex", flexDirection: "column", flex: 1 }}>
              <h1 style={{ fontSize: 22, fontWeight: 500, lineHeight: 1.4, margin: 0, whiteSpace: "pre-line" }}>
                {step.title}
              </h1>
              <div style={{ marginTop: 12, color: "var(--color-ink-soft)", fontSize: 14, lineHeight: 1.75 }}>
                {step.body.map((line, k) => (
                  <p key={k} style={{ margin: "0 0 10px" }}>
                    {line}
                  </p>
                ))}
              </div>
              <div style={{ marginTop: "auto", paddingTop: 20 }}>
                <PrimaryButton onClick={next}>{step.cta}</PrimaryButton>
              </div>
            </div>
          </div>
        )}

        {step.kind === "list" && (
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <h1 style={{ fontSize: 21, fontWeight: 500, margin: "4px 0 6px" }}>{step.title}</h1>
            <p style={{ fontSize: 13, color: "var(--color-ink-soft)", lineHeight: 1.55, margin: "0 0 16px" }}>
              {step.guide}
            </p>

            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addItem(step.field)}
                placeholder="여기에 입력…"
                style={{
                  flex: 1,
                  height: 44,
                  background: "var(--color-field)",
                  border: "none",
                  borderRadius: 12,
                  padding: "0 12px",
                  fontSize: 13,
                }}
              />
              <button
                onClick={() => addItem(step.field)}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  border: "none",
                  background: "var(--color-brand)",
                  color: "#fff",
                  fontSize: 22,
                  cursor: "pointer",
                }}
                aria-label="추가"
              >
                +
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
              {roadmap[step.field].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: 13,
                    background: "var(--color-surface)",
                    borderRadius: 14,
                    boxShadow: "0 3px 12px rgba(60,70,110,0.06)",
                  }}
                >
                  <span style={{ flex: 1, fontSize: 13 }}>{item}</span>
                  <button
                    onClick={() => removeItem(step.field, idx)}
                    style={{ background: "none", border: "none", color: "#b6becc", fontSize: 16, cursor: "pointer" }}
                    aria-label="삭제"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <ExampleTrigger onClick={() => setShowExamples(true)} />

            <div style={{ marginTop: "auto", paddingTop: 16 }}>
              <PrimaryButton onClick={next} disabled={roadmap[step.field].length === 0}>
                {step.cta}
              </PrimaryButton>
            </div>
          </div>
        )}

        {step.kind === "text" && (
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <h1 style={{ fontSize: 21, fontWeight: 500, margin: "4px 0 6px" }}>{step.title}</h1>
            <p style={{ fontSize: 13, color: "var(--color-ink-soft)", lineHeight: 1.55, margin: "0 0 16px" }}>
              {step.guide}
            </p>
            <textarea
              value={roadmap.compass}
              onChange={(e) => setRoadmap({ compass: e.target.value })}
              placeholder="나의 방향성을 자유롭게 적어보세요…"
              style={{
                minHeight: 130,
                background: "var(--color-surface)",
                border: "1px solid var(--color-line)",
                borderRadius: 14,
                padding: 12,
                fontSize: 13,
                lineHeight: 1.6,
                resize: "vertical",
                marginBottom: 14,
              }}
            />
            <ExampleTrigger onClick={() => setShowExamples(true)} />
            <div style={{ marginTop: "auto", paddingTop: 16 }}>
              <PrimaryButton onClick={next} disabled={roadmap.compass.trim().length === 0}>
                {step.cta}
              </PrimaryButton>
            </div>
          </div>
        )}

        <button
          onClick={back}
          style={{
            background: "none",
            border: "none",
            color: "var(--color-ink-muted)",
            fontSize: 13,
            marginTop: 12,
            cursor: "pointer",
            visibility: i > 0 ? "visible" : "hidden",
          }}
        >
          이전
        </button>
      </div>

      {showExamples && "examples" in step && (
        <ExampleSheet examples={step.examples} onClose={() => setShowExamples(false)} />
      )}
    </Screen>
  );
}

function ExampleTrigger({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        border: "1px solid var(--color-brand-border)",
        background: "var(--color-surface)",
        borderRadius: 12,
        padding: 11,
        color: "var(--color-brand-text)",
        fontSize: 13,
        fontWeight: 500,
        cursor: "pointer",
      }}
    >
      예시가 필요하신가요?
    </button>
  );
}

function ExampleSheet({ examples, onClose }: { examples: string[]; onClose: () => void }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "rgba(26,16,40,0.45)",
        display: "flex",
        alignItems: "flex-end",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          background: "var(--color-surface)",
          borderRadius: "22px 22px 0 0",
          padding: "12px 18px 22px",
        }}
      >
        <div style={{ width: 40, height: 4, borderRadius: 3, background: "#e2d6f3", margin: "6px auto 16px" }} />
        <div style={{ fontSize: 17, fontWeight: 500, marginBottom: 14 }}>이렇게 적어보세요</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {examples.map((ex, k) => (
            <div key={k} style={{ padding: "11px 12px", background: "var(--color-brand-soft)", borderRadius: 12, fontSize: 13, lineHeight: 1.5 }}>
              {ex}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 16 }}>
          <PrimaryButton onClick={onClose}>닫기</PrimaryButton>
        </div>
      </div>
    </div>
  );
}
