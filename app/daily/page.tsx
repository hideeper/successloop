"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { useAppGuard } from "@/lib/useAppGuard";
import { Screen, TopBar, PrimaryButton } from "@/components/ui";
import type { SmartGoal } from "@/lib/types";

const emptyFields = { specific: "", measurable: "", agreed: "", realistic: "", timely: "" };
const smartLabels: { key: keyof typeof emptyFields; label: string; ph: string }[] = [
  { key: "specific", label: "S", ph: "구체적으로 — 무엇을" },
  { key: "measurable", label: "M", ph: "측정 가능하게 — 얼마나" },
  { key: "agreed", label: "A", ph: "동의 — 납득되는가" },
  { key: "realistic", label: "R", ph: "현실적으로 — 가능한가" },
  { key: "timely", label: "T", ph: "기일 — 언제까지" },
];

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function DailyPage() {
  const router = useRouter();
  const { saveDaily } = useStore();
  const [goals, setGoals] = useState<SmartGoal[]>([]);
  const [fields, setFields] = useState({ ...emptyFields });
  const [action, setAction] = useState("");
  const [showExamples, setShowExamples] = useState(false);

  useAppGuard();

  function addGoal() {
    if (!fields.specific.trim()) return;
    setGoals((g) => [...g, { ...fields, important: false }]);
    setFields({ ...emptyFields });
  }

  function toggleImportant(idx: number) {
    setGoals((g) => g.map((x, k) => ({ ...x, important: k === idx ? !x.important : x.important })));
  }

  function save() {
    saveDaily({ date: todayStr(), goals, action });
    router.replace("/today");
  }

  return (
    <Screen>
      <TopBar
        title="잠재의식 Daily on"
        onBack={() => router.replace("/today")}
        right={<span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-brand)" }}>{goals.length}/10</span>}
      />

      <div style={{ flex: 1, overflowY: "auto", padding: "0 14px 20px" }}>
        <div style={{ fontSize: 12, color: "var(--color-ink-muted)", textAlign: "center", marginBottom: 14 }}>
          오늘 밤 · SMART 목표 10개
        </div>

        <div style={{ background: "var(--color-surface)", borderRadius: 18, padding: 14, boxShadow: "0 5px 18px rgba(60,70,110,0.08)", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-brand)" }}>No.{goals.length + 1} 작성</span>
            <button onClick={() => setShowExamples(true)} style={{ fontSize: 12, color: "var(--color-ink-muted)", border: "1px solid var(--color-brand-border)", borderRadius: 14, padding: "3px 10px", background: "none", cursor: "pointer" }}>
              예시
            </button>
          </div>
          {smartLabels.map((f) => (
            <div key={f.key} style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 500, color: "#fff", background: "var(--color-brand)", borderRadius: 7, padding: "2px 7px" }}>{f.label}</span>
              <input
                value={fields[f.key]}
                onChange={(e) => setFields((s) => ({ ...s, [f.key]: e.target.value }))}
                placeholder={f.ph}
                style={{ flex: 1, height: 32, background: "var(--color-field)", border: "none", borderRadius: 8, padding: "0 10px", fontSize: 12 }}
              />
            </div>
          ))}
          <div style={{ marginTop: 4 }}>
            <PrimaryButton onClick={addGoal} disabled={!fields.specific.trim()}>
              목표 추가
            </PrimaryButton>
          </div>
        </div>

        {goals.length > 0 && (
          <>
            <div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-ink-muted)", margin: "0 4px 8px" }}>
              작성한 목표 · ★ 중요 목표 선택
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
              {goals.map((g, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: 12,
                    background: "var(--color-surface)",
                    borderRadius: 14,
                    boxShadow: "0 3px 12px rgba(60,70,110,0.06)",
                    border: g.important ? "1.5px solid var(--color-brand-border)" : "1.5px solid transparent",
                  }}
                >
                  <span style={{ fontSize: 12, color: "var(--color-ink-muted)" }}>{idx + 1}</span>
                  <span style={{ flex: 1, fontSize: 13 }}>{g.specific}</span>
                  <button
                    onClick={() => toggleImportant(idx)}
                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: 17, color: g.important ? "var(--color-brand)" : "#c3cad6" }}
                    aria-label="중요 목표"
                  >
                    ★
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        <div style={{ background: "var(--color-surface)", borderRadius: 14, padding: 13, boxShadow: "0 3px 12px rgba(60,70,110,0.06)", marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>오늘의 사소한 행동</div>
          <input
            value={action}
            onChange={(e) => setAction(e.target.value)}
            placeholder="무엇이든 할 수 있는 한 가지…"
            style={{ width: "100%", height: 40, background: "var(--color-field)", border: "none", borderRadius: 10, padding: "0 12px", fontSize: 13 }}
          />
        </div>

        <PrimaryButton onClick={save} disabled={goals.length === 0}>
          저장
        </PrimaryButton>
      </div>

      {showExamples && <SmartExamples onClose={() => setShowExamples(false)} />}
    </Screen>
  );
}

function SmartExamples({ onClose }: { onClose: () => void }) {
  const smart = [
    ["S", "연 수입을 늘린다"],
    ["M", "사업 수익을 현재 연봉 이상으로"],
    ["A", "이 정도면 근로소득에서 자유로울 수 있다"],
    ["R", "달성 가능한 수치다"],
    ["T", "27년 연말까지"],
  ];
  return (
    <div style={{ position: "absolute", inset: 0, background: "rgba(26,16,40,0.45)", display: "flex", alignItems: "flex-end" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", background: "var(--color-surface)", borderRadius: "22px 22px 0 0", padding: "12px 18px 20px", maxHeight: "80%", overflowY: "auto" }}>
        <div style={{ width: 40, height: 4, borderRadius: 3, background: "#e2d6f3", margin: "6px auto 14px" }} />
        <div style={{ fontSize: 17, fontWeight: 500, marginBottom: 12 }}>이렇게 작성해요</div>

        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-brand-text)", marginBottom: 8 }}>① SMART로 구체화</div>
        <div style={{ background: "var(--color-brand-soft)", borderRadius: 12, padding: 12, marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 10 }}>목표: 사업 수익으로 경제적 자유 상태가 된다</div>
          {smart.map(([l, t]) => (
            <div key={l} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 7 }}>
              <span style={{ fontSize: 11, fontWeight: 500, color: "#fff", background: "var(--color-brand)", borderRadius: 7, padding: "2px 7px", minWidth: 16, textAlign: "center" }}>{l}</span>
              <span style={{ fontSize: 12, color: "#3a3450", lineHeight: 1.4 }}>{t}</span>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-brand-text)", marginBottom: 8 }}>② 중요한 목표 선정</div>
        <div style={{ fontSize: 12, color: "var(--color-ink-soft)", lineHeight: 1.5, marginBottom: 16 }}>
          여러 목표 중 “실현되면 다른 목표도 같이 달성되는 것”을 ★ 중요 목표로 고르세요. 예) ‘브랜드 사업으로 성공하기’가 이뤄지면 ‘내 집 장만’·‘경제적 자유’도 함께 달성됩니다.
        </div>

        <PrimaryButton onClick={onClose}>닫기</PrimaryButton>
      </div>
    </div>
  );
}
