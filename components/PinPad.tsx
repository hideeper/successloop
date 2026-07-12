"use client";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"];

export function PinDots({ length, error = false }: { length: number; error?: boolean }) {
  return (
    <div style={{ display: "flex", gap: 16, marginBottom: 28 }}>
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            width: 15,
            height: 15,
            borderRadius: "50%",
            background: error ? "#e24b4a" : i < length ? "var(--color-brand)" : "#d6dbe4",
          }}
        />
      ))}
    </div>
  );
}

export function PinPad({
  value,
  onChange,
  onComplete,
}: {
  value: string;
  onChange: (v: string) => void;
  onComplete: (pin: string) => void;
}) {
  function press(k: string) {
    if (k === "⌫") {
      onChange(value.slice(0, -1));
      return;
    }
    if (value.length >= 4) return;
    const next = value + k;
    onChange(next);
    if (next.length === 4) onComplete(next);
  }

  return (
    <div
      style={{
        background: "var(--color-surface)",
        borderRadius: 20,
        padding: "18px 22px",
        boxShadow: "0 6px 20px rgba(60,70,110,0.08)",
        width: "100%",
      }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "16px 30px" }}>
        {KEYS.map((k, i) =>
          k === "" ? (
            <div key={i} />
          ) : (
            <button
              key={i}
              onClick={() => press(k)}
              style={{
                background: "none",
                border: "none",
                fontSize: 23,
                fontWeight: 500,
                color: k === "⌫" ? "var(--color-ink-muted)" : "var(--color-ink)",
                cursor: "pointer",
                padding: 4,
              }}
            >
              {k}
            </button>
          ),
        )}
      </div>
    </div>
  );
}
