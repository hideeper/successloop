import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // 로그인 후 어디로 갈지는 useAppGuard가 약관 동의/온보딩/PIN 상태를 보고 알아서 정한다.
  return NextResponse.redirect(`${origin}/today`);
}
