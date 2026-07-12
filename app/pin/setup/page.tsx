"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Screen } from "@/components/ui";
import { PinDots, PinPad } from "@/components/PinPad";

export default function PinSetupPage() {
  const router = useRouter();
  const { hydrated, user, stage1Done, setPin, unlock } = useStore();
  const [value, setValue] = useState("");

  useEffect(() => {
    if (!hydrated) return;
    if (!user) router.replace("/login");
    else if (!stage1Done) router.replace("/onboarding");
  }, [hydrated, user, stage1Done, router]);

  async function complete(pin: string) {
    await setPin(pin);
    unlock();
    router.replace("/today");
  }

  return (
    <Screen>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "30px 16px 22px",
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 15,
            background: "var(--color-brand)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 25,
            marginBottom: 16,
          }}
        >
          🔒
        </div>
        <div style={{ fontSize: 19, fontWeight: 500, marginBottom: 6 }}>PIN 번호를 설정하세요</div>
        <div style={{ fontSize: 13, color: "var(--color-ink-muted)", marginBottom: 26, textAlign: "center" }}>
          4자리 숫자로 앱을 안전하게 지켜요.
        </div>

        <PinDots length={value.length} />
        <PinPad value={value} onChange={setValue} onComplete={complete} />
      </div>
    </Screen>
  );
}
