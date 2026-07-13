"use client";

import { useEffect } from "react";

// PWA 설치 조건(서비스 워커 등록) 충족용 — 알림 권한 요청과는 무관하게 항상 등록한다.
export function RegisterSW() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);
  return null;
}
