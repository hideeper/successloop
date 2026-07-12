import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendPushToUser } from "@/lib/push";

export const runtime = "nodejs";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const result = await sendPushToUser(supabase, user.id, {
    title: "SuccessLoop 테스트 알림",
    body: "알림이 정상적으로 도착했어요! 🔔",
    url: "/today",
  });

  if (result.sent === 0) {
    return NextResponse.json({ error: "no_active_subscription", ...result }, { status: 400 });
  }
  return NextResponse.json({ ok: true, ...result });
}
