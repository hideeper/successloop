"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "./store";

// 로그인 → 약관 동의 → 1단계 완료 → PIN 잠금 해제 순서를 강제하는 공통 가드.
export function useAppGuard() {
  const router = useRouter();
  const { hydrated, user, termsAgreed, stage1Done, hasPin, unlocked } = useStore();

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!termsAgreed) {
      router.replace("/consent");
      return;
    }
    if (!stage1Done) {
      router.replace("/onboarding");
      return;
    }
    if (hasPin && !unlocked) {
      router.replace("/pin/lock");
      return;
    }
  }, [hydrated, user, termsAgreed, stage1Done, hasPin, unlocked, router]);
}
