"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function replyToInquiry(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: myProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();
  if (myProfile?.role !== "admin") return;

  const id = formData.get("id");
  const reply = String(formData.get("reply") ?? "").trim();
  if (!id || !reply) return;

  const admin = createAdminClient();
  await admin
    .from("inquiries")
    .update({ admin_reply: reply, status: "done", replied_at: new Date().toISOString() })
    .eq("id", Number(id));

  revalidatePath("/admin");
}
