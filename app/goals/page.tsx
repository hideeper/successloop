"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { useAppGuard } from "@/lib/useAppGuard";
import { Screen, BottomNav } from "@/components/ui";
import type { RoadmapData } from "@/lib/types";

type ListField = "dislikes" | "likes" | "realizations";

const sections: { field: ListField; title: string; placeholder: string }[] = [
  { field: "dislikes", title: "하기 싫은 일", placeholder: "여기에 입력…" },
  { field: "likes", title: "하고 싶은 일", placeholder: "여기에 입력…" },
  { field: "realizations", title: "실현 목록", placeholder: "예: ~한다 / ~이다" },
];

export default function GoalsPage() {
  const router = useRouter();
  const { roadmap, setRoadmap, startNewRoadmap } = useStore();
  useAppGuard();

  return (
    <Screen>
      <div style={{ flex: 1, padding: "18px 14px 8px", overflowY: "auto" }}>
        <div style={{ padding: "0 4px", marginBottom: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 500 }}>나의 목표</div>
          <div style={{ fontSize: 12, color: "var(--color-ink-muted)", marginTop: 2 }}>
            언제든 다시 보고 다듬을 수 있어요.
          </div>
        </div>

        {sections.map((sec) => (
          <ListSection
            key={sec.field}
            title={sec.title}
            placeholder={sec.placeholder}
            items={roadmap[sec.field]}
            onChange={(items) => setRoadmap({ [sec.field]: items } as Partial<RoadmapData>)}
          />
        ))}

        <CompassSection value={roadmap.compass} onSave={(v) => setRoadmap({ compass: v })} />

        <LockedCategories />

        <NewVersionButton
          onConfirm={async () => {
            await startNewRoadmap();
            router.replace("/onboarding");
          }}
        />
      </div>

      <BottomNav active="goals" />
    </Screen>
  );
}

function ListSection({
  title,
  placeholder,
  items,
  onChange,
}: {
  title: string;
  placeholder: string;
  items: string[];
  onChange: (items: string[]) => void;
}) {
  const [input, setInput] = useState("");

  function add() {
    const v = input.trim();
    if (!v) return;
    onChange([...items, v]);
    setInput("");
  }

  function remove(idx: number) {
    onChange(items.filter((_, k) => k !== idx));
  }

  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 13, fontWeight: 500, margin: "0 4px 9px" }}>{title}</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder={placeholder}
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
          onClick={add}
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            border: "none",
            background: "var(--color-brand)",
            color: "#fff",
            fontSize: 20,
            cursor: "pointer",
          }}
          aria-label="추가"
        >
          +
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.length === 0 && (
          <div style={{ fontSize: 12, color: "var(--color-ink-muted)", padding: "4px 4px" }}>아직 없어요.</div>
        )}
        {items.map((item, idx) => (
          <EditableItem
            key={idx}
            value={item}
            onSave={(v) => {
              const next = [...items];
              next[idx] = v;
              onChange(next);
            }}
            onDelete={() => remove(idx)}
          />
        ))}
      </div>
    </div>
  );
}

function EditableItem({
  value,
  onSave,
  onDelete,
}: {
  value: string;
  onSave: (v: string) => void;
  onDelete: () => void;
}) {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  function commit() {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== value) onSave(trimmed);
    else if (!trimmed) setDraft(value);
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: 12,
        background: "var(--color-surface)",
        borderRadius: 14,
        boxShadow: "0 3px 12px rgba(60,70,110,0.06)",
      }}
    >
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
        style={{
          flex: 1,
          fontSize: 13,
          border: "none",
          background: "transparent",
          outline: "none",
          color: "var(--color-ink)",
          padding: 0,
        }}
      />
      <button
        onClick={onDelete}
        style={{ background: "none", border: "none", color: "#b6becc", fontSize: 15, cursor: "pointer" }}
        aria-label="삭제"
      >
        ✕
      </button>
    </div>
  );
}

function CompassSection({ value, onSave }: { value: string; onSave: (v: string) => void }) {
  const [draft, setDraft] = useState(value);

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 13, fontWeight: 500, margin: "0 4px 9px" }}>인생의 나침반</div>
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => draft !== value && onSave(draft)}
        placeholder="나의 방향성을 자유롭게 적어보세요…"
        style={{
          width: "100%",
          minHeight: 110,
          background: "var(--color-surface)",
          border: "1px solid var(--color-line)",
          borderRadius: 14,
          padding: 12,
          fontSize: 13,
          lineHeight: 1.6,
          resize: "vertical",
        }}
      />
    </div>
  );
}

const LOCKED_CATEGORIES = [
  { icon: "👁️", title: "시각화", sub: "미래의 성공한 나를 심상화" },
  { icon: "🧭", title: "셀프 포지셔닝", sub: "슈퍼 셀프 이미지·정체성" },
];

function LockedCategories() {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 13, fontWeight: 500, margin: "0 4px 9px" }}>추가 서비스 (준비 중)</div>
      <div style={{ display: "flex", gap: 10 }}>
        {LOCKED_CATEGORIES.map((c) => (
          <div
            key={c.title}
            style={{
              flex: 1,
              background: "var(--color-brand-soft)",
              border: "1px solid var(--color-brand-border)",
              borderRadius: 16,
              padding: 14,
              textAlign: "center",
              opacity: 0.75,
            }}
          >
            <div style={{ fontSize: 22, marginBottom: 6 }}>{c.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-brand-text)" }}>
              🔒 {c.title}
            </div>
            <div style={{ fontSize: 11, color: "var(--color-brand-text)", marginTop: 2 }}>{c.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NewVersionButton({ onConfirm }: { onConfirm: () => void }) {
  function handleClick() {
    if (confirm("새로 작성하시겠어요? 지금까지 적은 목표는 기록으로 보존되고, 처음부터 새로 시작합니다.")) {
      onConfirm();
    }
  }

  return (
    <div style={{ paddingBottom: 8 }}>
      <button
        onClick={handleClick}
        style={{
          width: "100%",
          background: "none",
          border: "1px solid var(--color-line)",
          borderRadius: "var(--radius-pill)",
          padding: 13,
          fontSize: 13,
          fontWeight: 500,
          color: "var(--color-ink-soft)",
          cursor: "pointer",
        }}
      >
        새로 작성하기
      </button>
    </div>
  );
}
