import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldX } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

async function signOut() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export default async function DeniedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="inline-flex p-4 rounded-full bg-destructive/10 text-destructive">
          <ShieldX className="h-10 w-10" />
        </div>
        <h1 className="text-3xl font-bold">Erisim Reddedildi</h1>
        <p className="text-muted-foreground">
          Bu panel sadece yetkili yoneticiler icindir.
          {user?.email ? (
            <>
              <br />
              Aktif hesap: <span className="font-mono">{user.email}</span>
            </>
          ) : null}
        </p>
        <div className="flex gap-3 justify-center">
          <form action={signOut}>
            <Button variant="outline" type="submit">
              Cikis yap
            </Button>
          </form>
          <Button asChild>
            <Link href="/login">Farkli hesapla giris</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
