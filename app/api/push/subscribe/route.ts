import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const body = await req.json();
  const endpoint: string | undefined = body?.endpoint;
  const p256dh: string | undefined = body?.keys?.p256dh;
  const auth: string | undefined = body?.keys?.auth;
  if (!endpoint || !p256dh || !auth) {
    return NextResponse.json({ error: "invalid subscription" }, { status: 400 });
  }

  // 같은 구독 재등록 시 중복 방지
  await supabase.from("push_subscriptions").delete().eq("user_id", user.id).eq("endpoint", endpoint);
  await supabase.from("push_subscriptions").insert({ user_id: user.id, endpoint, p256dh, auth });

  // 리마인드 시간 기본값 보장 (없으면 생성)
  await supabase
    .from("reminder_settings")
    .upsert(
      { user_id: user.id, morning_at: "07:00", night_at: "22:00" },
      { onConflict: "user_id", ignoreDuplicates: true },
    );

  return NextResponse.json({ ok: true });
}
