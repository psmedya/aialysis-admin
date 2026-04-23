import { createClient } from "@/lib/supabase/server";
import { ConfigEditor } from "./_config-editor";

export const dynamic = "force-dynamic";

export default async function ConfigPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("app_config")
    .select("*")
    .order("key", { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Remote Config</h1>
        <p className="text-muted-foreground">
          Uygulama genelinde kullanilan konfigurasyon anahtarlari (app_config)
        </p>
      </div>

      {error && (
        <div className="text-sm text-destructive">
          Yukleme hatasi: {error.message}
        </div>
      )}

      <ConfigEditor rows={data ?? []} />
    </div>
  );
}
