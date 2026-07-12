"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

export function Screen({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "var(--color-page)",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 440,
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function PrimaryButton({
  children,
  onClick,
  type = "button",
  disabled = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "100%",
        background: disabled ? "#c9cad6" : "var(--color-brand)",
        color: "#fff",
        border: "none",
        borderRadius: "var(--radius-pill)",
        padding: "14px",
        fontSize: 15,
        fontWeight: 500,
        cursor: disabled ? "default" : "pointer",
      }}
    >
      {children}
    </button>
  );
}

export function PhotoBox({
  label,
  height = 200,
  radius = 0,
}: {
  label: string;
  height?: number;
  radius?: number;
}) {
  return (
    <div
      style={{
        height,
        borderRadius: radius,
        background: "#e3e6ec",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "#9aa3b2",
        fontSize: 12,
        gap: 6,
      }}
    >
      <span style={{ fontSize: 11 }}>사진</span>
      {label}
    </div>
  );
}

export function TopBar({
  title,
  right,
  onBack,
}: {
  title?: string;
  right?: ReactNode;
  onBack?: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 16px",
      }}
    >
      <button
        onClick={onBack}
        style={{
          background: "none",
          border: "none",
          fontSize: 20,
          color: "var(--color-ink)",
          cursor: onBack ? "pointer" : "default",
          width: 24,
          visibility: onBack ? "visible" : "hidden",
        }}
        aria-label="뒤로"
      >
        ‹
      </button>
      <span style={{ fontSize: 15, fontWeight: 500 }}>{title}</span>
      <span style={{ width: 24, textAlign: "right" }}>{right}</span>
    </div>
  );
}

const navItems = [
  { key: "today", label: "오늘", href: "/today" },
  { key: "goals", label: "목표", href: "/goals" },
  { key: "records", label: "기록", href: "/today" },
  { key: "settings", label: "설정", href: "/settings" },
];

export function BottomNav({ active }: { active: string }) {
  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-around",
        padding: "10px 4px 16px",
        borderTop: "1px solid var(--color-line)",
        background: "var(--color-surface)",
      }}
    >
      {navItems.map((it) => {
        const style: CSSProperties = {
          textDecoration: "none",
          color: active === it.key ? "var(--color-brand)" : "#b6becc",
          fontSize: 11,
          fontWeight: 500,
        };
        return (
          <Link key={it.key} href={it.href} style={style}>
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
