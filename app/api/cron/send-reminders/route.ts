import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPushToUser } from "@/lib/push";

export const runtime = "nodejs";

// GitHub Actions에서 매시 정각에 호출하므로, 어떤 목표 시각이든 한 번의 실행 안에 걸리도록
// 최소 30분(시간당 실행 간격의 절반)을 확보한다.
const WINDOW_MINUTES = 30;

const MAX_RANDOM_PER_DAY = 5;

const RANDOM_MESSAGES = [
  "잠깐, 오늘 목표를 다시 떠올려볼까요?",
  "지금 이 순간에도 목표는 이루어지고 있어요.",
  "실현 목록을 한 번 더 읽어보세요.",
];

function toMinutes(hm: string): number {
  const [h, m] = hm.split(":").map(Number);
  return h * 60 + m;
}

function minutesToHM(mins: number): string {
  const wrapped = ((mins % 1440) + 1440) % 1440;
  const h = Math.floor(wrapped / 60);
  const m = wrapped % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function isWithinWindow(nowHM: string, targetHM: string): boolean {
  return Math.abs(toMinutes(nowHM) - toMinutes(targetHM)) <= WINDOW_MINUTES;
}

// 자정을 넘길 수 있는 방해금지 시간대(예: 23:00~07:00)를 포함해 범위 포함 여부를 판단한다.
// start === end(예: "00:00"~"00:00")는 꺼짐 상태를 뜻하므로 항상 false를 반환한다.
function isWithinRange(nowHM: string, startHM: string, endHM: string): boolean {
  const now = toMinutes(nowHM);
  const start = toMinutes(startHM);
  const end = toMinutes(endHM);
  if (start === end) return false;
  if (start < end) return now >= start && now < end;
  return now >= start || now < end;
}

// seed로 시드를 만들어, 같은 날 여러 번 호출돼도 동일한 랜덤 목표 시각을 계산한다.
function seededMinuteInRange(seed: string, startHM: string, endHM: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  const start = toMinutes(startHM);
  const end = toMinutes(endHM);
  const span = Math.max(1, end - start);
  return start + (hash % span);
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

interface ReminderRow {
  user_id: string;
  morning_at: string | null;
  night_at: string | null;
  timezone: string | null;
  random_enabled: boolean;
  random_per_day: number;
  random_window_start: string;
  random_window_end: string;
  dnd_start: string;
  dnd_end: string;
}

interface ReminderTask {
  key: string;
  at: string | null;
  title: string;
  body: string;
  url: string;
}

function reminderTasks(s: ReminderRow, date: string): ReminderTask[] {
  const tasks: ReminderTask[] = [
    {
      key: "morning",
      at: s.morning_at?.slice(0, 5) ?? null,
      title: "아침 리마인드",
      body: "실현 목록을 읽을 시간이에요.",
      url: "/read?mode=morning",
    },
    {
      key: "night",
      at: s.night_at?.slice(0, 5) ?? null,
      title: "밤 리마인드",
      body: "목록을 읽고 오늘의 Daily on을 채워보세요.",
      url: "/read?mode=night",
    },
  ];

  if (s.random_enabled) {
    const count = Math.min(MAX_RANDOM_PER_DAY, Math.max(1, s.random_per_day || 1));
    for (let i = 0; i < count; i++) {
      const targetMinute = seededMinuteInRange(
        `${s.user_id}:${date}:${i}`,
        s.random_window_start.slice(0, 5),
        s.random_window_end.slice(0, 5),
      );
      tasks.push({
        key: `random-${i}`,
        at: minutesToHM(targetMinute),
        title: "랜덤 리마인드",
        body: RANDOM_MESSAGES[Math.floor(Math.random() * RANDOM_MESSAGES.length)],
        url: "/read?mode=daytime",
      });
    }
  }

  return tasks;
}

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const db = createAdminClient();
  const { data: settings, error } = await db
    .from("reminder_settings")
    .select(
      "user_id, morning_at, night_at, timezone, random_enabled, random_per_day, random_window_start, random_window_end, dnd_start, dnd_end",
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let sentCount = 0;
  let skipped = 0;

  for (const s of (settings ?? []) as ReminderRow[]) {
    const tz = s.timezone || "Asia/Seoul";
    const { hm, date } = localTimeParts(tz);

    if (isWithinRange(hm, s.dnd_start.slice(0, 5), s.dnd_end.slice(0, 5))) {
      skipped++;
      continue;
    }

    for (const r of reminderTasks(s, date)) {
      if (!r.at) continue;
      if (!isWithinWindow(hm, r.at)) continue;

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
        await db.from("usage_events").insert({ user_id: s.user_id, event_type: eventType, meta: { date } });
        sentCount++;
      }
    }
  }

  return NextResponse.json({ ok: true, sentCount, skipped });
}
