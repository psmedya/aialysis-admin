import { createClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function isAdmin(email: string | undefined | null) {
  if (!email) return false;
  const supabase = await createClient();
  const { data } = await supabase
    .from("admin_emails")
    .select("email")
    .eq("email", email)
    .maybeSingle();
  return !!data;
}
