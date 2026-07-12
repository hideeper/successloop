"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { Screen } from "@/components/ui";
import { PinDots, PinPad } from "@/components/PinPad";

export default function PinLockPage() {
  const router = useRouter();
  const { hydrated, user, hasPin, verifyPin, unlock } = useStore();
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (!user) router.replace("/login");
    else if (!hasPin) router.replace("/today");
  }, [hydrated, user, hasPin, router]);

  async function complete(entered: string) {
    const ok = await verifyPin(entered);
    if (ok) {
      unlock();
      router.replace("/today");
      return;
    }
    setError(true);
    setTimeout(() => {
      setError(false);
      setValue("");
    }, 700);
  }

  return (
    <Screen>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "34px 16px 22px",
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 15,
            background: "var(--color-brand-soft)",
            color: "var(--color-brand)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 25,
            marginBottom: 16,
          }}
        >
          🔒
        </div>
        <div style={{ fontSize: 19, fontWeight: 500, marginBottom: 6 }}>PIN을 입력하세요</div>
        <div style={{ fontSize: 13, color: "var(--color-ink-muted)", marginBottom: 26 }}>
          SuccessLoop 잠금 해제
        </div>

        <PinDots length={value.length} error={error} />
        <PinPad value={value} onChange={setValue} onComplete={complete} />

        <Link
          href="/pin/setup"
          style={{ marginTop: 18, fontSize: 13, color: "var(--color-brand)", fontWeight: 500, textDecoration: "none" }}
        >
          PIN을 잊으셨나요?
        </Link>
      </div>
    </Screen>
  );
}
