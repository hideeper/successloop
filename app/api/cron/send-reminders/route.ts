import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPushToUser } from "@/lib/push";

export const runtime = "nodejs";

const WINDOW_MINUTES = 10; // 크론 실행 간격보다 넉넉하게 잡아 놓치는 걸 방지

function toMinutes(hm: string): number {
  const [h, m] = hm.split(":").map(Number);
  return h * 60 + m;
}

function isWithinWindow(nowHM: string, targetHM: string): boolean {
  return Math.abs(toMinutes(nowHM) - toMinutes(targetHM)) <= WINDOW_MINUTES;
}

function localTimeParts(tz: string) {
  const now = new Date();
  const hm = new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(now);
  const date = new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(now);
  return { hm, date };
}

const REMINDERS: {
  key: "morning" | "night";
  field: "morning_at" | "night_at";
  title: string;
  body: string;
  url: string;
}[] = [
  {
    key: "morning",
    field: "morning_at",
    title: "아침 리마인드",
    body: "실현 목록을 읽을 시간이에요.",
    url: "/read?mode=morning",
  },
  {
    key: "night",
    field: "night_at",
    title: "밤 리마인드",
    body: "목록을 읽고 오늘의 Daily on을 채워보세요.",
    url: "/read?mode=night",
  },
];

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const db = createAdminClient();
  const { data: settings, error } = await db
    .from("reminder_settings")
    .select("user_id, morning_at, night_at, timezone");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let sentCount = 0;
  let skipped = 0;

  for (const s of settings ?? []) {
    const tz = s.timezone || "Asia/Seoul";
    const { hm, date } = localTimeParts(tz);

    for (const r of REMINDERS) {
      const at = s[r.field] as string | null;
      if (!at) continue;
      if (!isWithinWindow(hm, at.slice(0, 5))) continue;

      const eventType = `push_${r.key}_sent`;
      const { data: already } = await db
        .from("usage_events")
        .select("id")
        .eq("user_id", s.user_id)
        .eq("event_type", eventType)
        .eq("meta->>date", date)
        .maybeSingle();
      if (already) {
        skipped++;
        continue;
      }

      const result = await sendPushToUser(db, s.user_id, { title: r.title, body: r.body, url: r.url });
      if (result.sent > 0) {
        await db
          .from("usage_events")
          .insert({ user_id: s.user_id, event_type: eventType, meta: { date } });
        sentCount++;
      }
    }
  }

  return NextResponse.json({ ok: true, sentCount, skipped });
}
