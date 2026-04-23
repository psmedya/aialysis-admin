import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * POST /api/trigger-function
 * Body: { function: string, body?: unknown }
 *
 * Admin sadece. Supabase Edge Function'a anon key ile cagri yapar.
 * (Service role gerektiginde SUPABASE_SERVICE_ROLE_KEY kullanilir.)
 */
export async function POST(request: Request) {
  // auth & admin check
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { data: adminRow } = await supabase
    .from("admin_emails")
    .select("email")
    .eq("email", user.email)
    .maybeSingle();
  if (!adminRow) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  // parse
  let payload: { function?: string; body?: unknown };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const fn = payload.function;
  if (!fn || typeof fn !== "string" || !/^[a-z0-9-_]+$/.test(fn)) {
    return NextResponse.json({ error: "invalid function name" }, { status: 400 });
  }

  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/${fn}`;
  const authToken =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const t0 = Date.now();
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(payload.body ?? {}),
  });
  const durationMs = Date.now() - t0;

  const text = await res.text();
  let data: unknown = text;
  try {
    data = JSON.parse(text);
  } catch {
    /* keep as text */
  }

  return NextResponse.json(
    { status: res.status, ok: res.ok, durationMs, data },
    { status: 200 },
  );
}
