"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";

export default function Home() {
  const router = useRouter();
  const { hydrated, user, stage1Done, hasPin, unlocked } = useStore();

  useEffect(() => {
    if (!hydrated) return;
    if (!user) router.replace("/login");
    else if (!stage1Done) router.replace("/onboarding");
    else if (hasPin && !unlocked) router.replace("/pin/lock");
    else router.replace("/today");
  }, [hydrated, user, stage1Done, hasPin, unlocked, router]);

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
