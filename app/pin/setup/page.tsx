"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Screen } from "@/components/ui";
import { PinDots, PinPad } from "@/components/PinPad";

export default function PinSetupPage() {
  const router = useRouter();
  const { hydrated, user, stage1Done, hasPin, unlocked, setPin, unlock } = useStore();
  const [value, setValue] = useState("");

  // 이미 PIN이 있는데 아직 잠금을 풀지 않은 상태로 이 URL에 직접 들어온 경우
  // (예: 기기를 주운 사람) 본인 확인 없이 PIN을 새로 설정하지 못하도록 막는다.
  useEffect(() => {
    if (!hydrated) return;
    if (!user) router.replace("/login");
    else if (!stage1Done) router.replace("/onboarding");
    else if (hasPin && !unlocked) router.replace("/pin/recover");
  }, [hydrated, user, stage1Done, hasPin, unlocked, router]);

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
