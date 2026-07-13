"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { useAppGuard } from "@/lib/useAppGuard";
import { createClient } from "@/lib/supabase/client";
import { createInquiry, loadMyInquiries } from "@/lib/supabase/data";
import { Screen, TopBar, PrimaryButton } from "@/components/ui";
import type { Inquiry, InquiryType } from "@/lib/types";

const TYPES: InquiryType[] = ["버그", "제안", "계정", "기타"];

const statusLabel: Record<Inquiry["status"], string> = {
  received: "접수됨",
  in_progress: "처리 중",
  done: "답변 완료",
};

export default function InquiryPage() {
  const router = useRouter();
  const { userId } = useStore();
  useAppGuard();

  const [supabase] = useState(() => createClient());
  const [type, setType] = useState<InquiryType>("버그");
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!userId) return;
    loadMyInquiries(supabase, userId).then((list) => {
      setInquiries(list);
      setLoaded(true);
    });
  }, [userId, supabase]);

  async function submit() {
    if (!userId || !content.trim()) return;
    setSending(true);
    setError(null);
    try {
      await createInquiry(supabase, userId, type, content.trim());
      setContent("");
      setInquiries(await loadMyInquiries(supabase, userId));
    } catch {
      setError("전송에 실패했어요. 다시 시도해주세요.");
    }
    setSending(false);
  }

  return (
    <Screen>
      <TopBar title="문의하기" onBack={() => router.replace("/settings")} />

      <div style={{ flex: 1, overflowY: "auto", padding: "8px 14px 20px" }}>
        <div
          style={{
            background: "var(--color-surface)",
            borderRadius: 16,
            padding: 16,
            boxShadow: "0 5px 18px rgba(60,70,110,0.08)",
            marginBottom: 20,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 9 }}>유형</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            {TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: type === t ? "#fff" : "var(--color-brand-text)",
                  background: type === t ? "var(--color-brand)" : "var(--color-brand-soft)",
                  border: "none",
                  borderRadius: 18,
                  padding: "8px 16px",
                  cursor: "pointer",
                }}
              >
                {t}
              </button>
            ))}
          </div>

          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 9 }}>내용</div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="어떤 점이 불편하셨나요? 자세히 적어주시면 빠르게 도와드릴게요."
            style={{
              width: "100%",
              minHeight: 110,
              background: "var(--color-field)",
              border: "none",
              borderRadius: 12,
              padding: 12,
              fontSize: 13,
              lineHeight: 1.5,
              resize: "vertical",
              marginBottom: 14,
            }}
          />

          {error && <p style={{ fontSize: 12, color: "#d14343", marginBottom: 10 }}>{error}</p>}

          <PrimaryButton onClick={submit} disabled={sending || !content.trim()}>
            {sending ? "보내는 중…" : "보내기"}
          </PrimaryButton>
        </div>

        {loaded && inquiries.length > 0 && (
          <>
            <div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-ink-muted)", margin: "0 4px 9px" }}>
              보낸 문의
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {inquiries.map((iq) => (
                <div
                  key={iq.id}
                  style={{
                    background: "var(--color-surface)",
                    borderRadius: 14,
                    padding: 13,
                    boxShadow: "0 3px 12px rgba(60,70,110,0.06)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 500,
                        color: "var(--color-brand-text)",
                        background: "var(--color-brand-soft)",
                        borderRadius: 10,
                        padding: "2px 8px",
                      }}
                    >
                      {iq.type}
                    </span>
                    <span style={{ fontSize: 11, color: "var(--color-ink-muted)" }}>{statusLabel[iq.status]}</span>
                    <span style={{ fontSize: 11, color: "var(--color-ink-muted)", marginLeft: "auto" }}>
                      {iq.createdAt}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: "var(--color-ink)", lineHeight: 1.5, marginBottom: iq.adminReply ? 8 : 0 }}>
                    {iq.content}
                  </div>
                  {iq.adminReply && (
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--color-ink-soft)",
                        background: "var(--color-field)",
                        borderRadius: 10,
                        padding: 10,
                        lineHeight: 1.5,
                      }}
                    >
                      <span style={{ fontWeight: 500, color: "var(--color-brand-text)" }}>답변 </span>
                      {iq.adminReply}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Screen>
  );
}
