import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { replyToInquiry } from "./actions";

export const dynamic = "force-dynamic";

const DAY_MS = 86_400_000;

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: myProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();
  if (myProfile?.role !== "admin") redirect("/today");

  const admin = createAdminClient();

  const [{ data: authUsers }, { data: profiles }, { data: goalRows }, { data: pushRows }, { data: inquiryRows }] =
    await Promise.all([
      admin.auth.admin.listUsers({ perPage: 1000 }),
      admin.from("profiles").select("user_id, role, onboarding_step, last_active_at, created_at"),
      admin.from("short_term_goals").select("user_id"),
      admin.from("push_subscriptions").select("user_id"),
      admin
        .from("inquiries")
        .select("id, user_id, type, content, status, admin_reply, created_at")
        .order("created_at", { ascending: false })
        .limit(30),
    ]);

  const allProfiles = profiles ?? [];
  const total = allProfiles.length;
  const stage1Done = allProfiles.filter((p) => p.onboarding_step === "completed").length;
  const dailyOnUsers = new Set((goalRows ?? []).map((r) => r.user_id)).size;
  const pushUsers = new Set((pushRows ?? []).map((r) => r.user_id)).size;

  const now = Date.now();
  const activeToday = allProfiles.filter(
    (p) => p.last_active_at && now - new Date(p.last_active_at).getTime() < DAY_MS,
  ).length;
  const active7d = allProfiles.filter(
    (p) => p.last_active_at && now - new Date(p.last_active_at).getTime() < 7 * DAY_MS,
  ).length;

  // 최근 14일 가입 추이 (일별)
  const signupsByDay = new Map<string, number>();
  for (const p of allProfiles) {
    const day = (p.created_at as string).slice(0, 10);
    signupsByDay.set(day, (signupsByDay.get(day) ?? 0) + 1);
  }
  const days: { day: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now - i * DAY_MS).toISOString().slice(0, 10);
    days.push({ day: d, count: signupsByDay.get(d) ?? 0 });
  }
  const maxDay = Math.max(1, ...days.map((d) => d.count));

  const emailMap = new Map((authUsers?.users ?? []).map((u) => [u.id, u.email ?? "-"]));

  const inquiries = (inquiryRows ?? []).map((r) => ({
    id: r.id as number,
    email: emailMap.get(r.user_id as string) ?? "-",
    type: r.type as string,
    content: r.content as string,
    status: r.status as string,
    adminReply: (r.admin_reply as string | null) ?? null,
    createdAt: (r.created_at as string).slice(0, 10),
  }));
  const unresolvedCount = inquiries.filter((iq) => iq.status !== "done").length;

  const recent = allProfiles
    .slice()
    .sort((a, b) => new Date(b.created_at as string).getTime() - new Date(a.created_at as string).getTime())
    .slice(0, 20)
    .map((p) => ({
      email: emailMap.get(p.user_id) ?? "-",
      createdAt: (p.created_at as string).slice(0, 10),
      stage1: p.onboarding_step === "completed",
      lastActive: p.last_active_at ? (p.last_active_at as string).slice(0, 10) : "-",
    }));

  return (
    <div style={{ minHeight: "100dvh", background: "var(--color-page)", padding: "18px 16px 40px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ fontSize: 20, fontWeight: 500, marginBottom: 4 }}>관리자 대시보드</div>
        <div style={{ fontSize: 12, color: "var(--color-ink-muted)", marginBottom: 20 }}>
          집계·익명 지표만 표시됩니다. 사용자의 목표·기록 내용은 노출되지 않습니다.
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: 12,
            marginBottom: 20,
          }}
        >
          <Stat label="총 가입자" value={total} />
          <Stat label="오늘 활성" value={activeToday} accent />
          <Stat label="7일 활성" value={active7d} />
          <Stat label="1단계 완료율" value={total ? `${Math.round((stage1Done / total) * 100)}%` : "0%"} />
          <Stat label="Daily on 사용자" value={dailyOnUsers} />
          <Stat label="알림 구독자" value={pushUsers} />
          <Stat label="미답변 문의" value={unresolvedCount} accent={unresolvedCount > 0} />
        </div>

        <Card title="최근 14일 가입 추이">
          <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 90 }}>
            {days.map((d) => (
              <div key={d.day} style={{ flex: 1, textAlign: "center" }}>
                <div
                  title={`${d.day}: ${d.count}명`}
                  style={{
                    height: `${Math.max(4, (d.count / maxDay) * 70)}px`,
                    background: "var(--color-brand)",
                    borderRadius: 3,
                    marginBottom: 4,
                  }}
                />
                <div style={{ fontSize: 9, color: "var(--color-ink-muted)" }}>{d.day.slice(5)}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="온보딩 퍼널">
          <FunnelRow label="가입" count={total} pct={100} />
          <FunnelRow label="1단계 완료" count={stage1Done} pct={total ? Math.round((stage1Done / total) * 100) : 0} />
          <FunnelRow
            label="Daily on 사용"
            count={dailyOnUsers}
            pct={total ? Math.round((dailyOnUsers / total) * 100) : 0}
          />
          <FunnelRow
            label="알림 구독"
            count={pushUsers}
            pct={total ? Math.round((pushUsers / total) * 100) : 0}
          />
        </Card>

        <Card title="최근 가입자">
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ color: "var(--color-ink-muted)", textAlign: "left" }}>
                  <th style={{ padding: "6px 8px", fontWeight: 500 }}>이메일</th>
                  <th style={{ padding: "6px 8px", fontWeight: 500 }}>가입일</th>
                  <th style={{ padding: "6px 8px", fontWeight: 500 }}>1단계</th>
                  <th style={{ padding: "6px 8px", fontWeight: 500 }}>최근 활동</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((r, i) => (
                  <tr key={i} style={{ borderTop: "1px solid var(--color-line)" }}>
                    <td style={{ padding: "8px" }}>{r.email}</td>
                    <td style={{ padding: "8px", color: "var(--color-ink-muted)" }}>{r.createdAt}</td>
                    <td style={{ padding: "8px" }}>{r.stage1 ? "✓" : "-"}</td>
                    <td style={{ padding: "8px", color: "var(--color-ink-muted)" }}>{r.lastActive}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title={`문의 내역 (미답변 ${unresolvedCount}건)`}>
          {inquiries.length === 0 ? (
            <div style={{ fontSize: 12, color: "var(--color-ink-muted)" }}>아직 문의가 없습니다.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {inquiries.map((iq) => (
                <div
                  key={iq.id}
                  style={{
                    border: "1px solid var(--color-line)",
                    borderRadius: 12,
                    padding: 12,
                    background: iq.status === "done" ? "var(--color-page)" : "var(--color-brand-soft)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, fontSize: 11 }}>
                    <span
                      style={{
                        fontWeight: 500,
                        color: "var(--color-brand-text)",
                        background: "var(--color-surface)",
                        borderRadius: 10,
                        padding: "2px 8px",
                      }}
                    >
                      {iq.type}
                    </span>
                    <span style={{ color: "var(--color-ink-muted)" }}>{iq.email}</span>
                    <span style={{ color: "var(--color-ink-muted)", marginLeft: "auto" }}>{iq.createdAt}</span>
                  </div>
                  <div style={{ fontSize: 13, marginBottom: 10, lineHeight: 1.5 }}>{iq.content}</div>

                  {iq.adminReply ? (
                    <div style={{ fontSize: 12, color: "var(--color-ink-soft)", lineHeight: 1.5 }}>
                      <span style={{ fontWeight: 500, color: "var(--color-brand-text)" }}>답변 완료: </span>
                      {iq.adminReply}
                    </div>
                  ) : (
                    <form action={replyToInquiry} style={{ display: "flex", gap: 8 }}>
                      <input type="hidden" name="id" value={iq.id} />
                      <textarea
                        name="reply"
                        placeholder="답변을 입력하세요"
                        required
                        style={{
                          flex: 1,
                          minHeight: 44,
                          fontSize: 12,
                          padding: 8,
                          borderRadius: 8,
                          border: "1px solid var(--color-line)",
                          resize: "vertical",
                        }}
                      />
                      <button
                        type="submit"
                        style={{
                          fontSize: 12,
                          fontWeight: 500,
                          color: "#fff",
                          background: "var(--color-brand)",
                          border: "none",
                          borderRadius: 8,
                          padding: "0 14px",
                          cursor: "pointer",
                        }}
                      >
                        답변 저장
                      </button>
                    </form>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value, accent = false }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div
      style={{
        background: "var(--color-surface)",
        borderRadius: 16,
        padding: 14,
        boxShadow: "0 4px 14px rgba(60,70,110,0.07)",
      }}
    >
      <div style={{ fontSize: 12, color: "var(--color-ink-muted)", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 500, color: accent ? "var(--color-brand)" : "var(--color-ink)" }}>
        {value}
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "var(--color-surface)",
        borderRadius: 16,
        padding: 16,
        boxShadow: "0 4px 14px rgba(60,70,110,0.07)",
        marginBottom: 16,
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>{title}</div>
      {children}
    </div>
  );
}

function FunnelRow({ label, count, pct }: { label: string; count: number; pct: number }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "90px 1fr 60px", alignItems: "center", gap: 8, marginBottom: 8 }}>
      <div style={{ fontSize: 12, color: "var(--color-ink-muted)", textAlign: "right" }}>{label}</div>
      <div style={{ height: 14, background: "var(--color-field)", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: "var(--color-brand)", borderRadius: 4 }} />
      </div>
      <div style={{ fontSize: 11, color: "var(--color-ink)" }}>
        {count} <span style={{ color: "var(--color-ink-muted)" }}>({pct}%)</span>
      </div>
    </div>
  );
}
