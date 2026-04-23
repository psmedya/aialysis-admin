import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "./_settings-form";

export const dynamic = "force-dynamic";

const WATCHED_KEYS = [
  "bakim_modu",
  "bakim_mesaji",
  "maintenance_mode",
  "maintenance_message",
  "forum_aktif",
  "blog_aktif",
  "feed_aktif",
  "leaderboard_aktif",
  "kill_switch",
];

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("app_config")
    .select("key, value")
    .in("key", WATCHED_KEYS);

  const map = new Map<string, unknown>();
  for (const row of data ?? []) map.set(row.key as string, row.value);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Ayarlar</h1>
        <p className="text-muted-foreground">
          Bakim modu, feature flag ve acil durum kontrolleri
        </p>
      </div>
      <SettingsForm
        initial={{
          bakim_modu: Boolean(map.get("bakim_modu") ?? map.get("maintenance_mode")),
          bakim_mesaji: String(
            map.get("bakim_mesaji") ?? map.get("maintenance_message") ?? "",
          ),
          forum_aktif: Boolean(map.get("forum_aktif") ?? true),
          blog_aktif: Boolean(map.get("blog_aktif") ?? true),
          feed_aktif: Boolean(map.get("feed_aktif") ?? true),
          leaderboard_aktif: Boolean(map.get("leaderboard_aktif") ?? true),
          kill_switch: Boolean(map.get("kill_switch") ?? false),
        }}
      />
    </div>
  );
}
