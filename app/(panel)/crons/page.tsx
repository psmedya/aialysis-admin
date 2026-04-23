import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CronsList } from "./_crons-list";

export const dynamic = "force-dynamic";

// Bilinen cron/function mapping — gerektiginde genisletilebilir
const KNOWN_CRONS = [
  { jobname: "mac-yenile", schedule: "*/5 * * * *", fn: "mac-yenile" },
  { jobname: "canli-mac-tarayici", schedule: "*/2 * * * *", fn: "canli-mac-tarayici" },
  { jobname: "mac-oncu-v2", schedule: "0 */6 * * *", fn: "mac-oncu-v2" },
  { jobname: "tahmin-sonuc-guncelle", schedule: "*/10 * * * *", fn: "tahmin-sonuc-guncelle" },
  { jobname: "kadro-guncelle", schedule: "0 */12 * * *", fn: "kadro-guncelle" },
  { jobname: "ogrenme-motoru", schedule: "0 2 * * *", fn: "ogrenme-motoru" },
  { jobname: "odds-live", schedule: "*/3 * * * *", fn: "odds-live" },
  { jobname: "puan-guncelle", schedule: "*/15 * * * *", fn: "puan-guncelle" },
  { jobname: "rutbe-hesapla", schedule: "0 */6 * * *", fn: "rutbe-hesapla" },
  { jobname: "istatistik-toplama", schedule: "0 3 * * *", fn: "istatistik-toplama" },
  { jobname: "blog-yayinla", schedule: "0 9 * * *", fn: "blog-yayinla" },
  { jobname: "cache-temizle", schedule: "0 4 * * *", fn: "cache-temizle" },
];

export default async function CronsPage() {
  const supabase = await createClient();
  const { data: health } = await supabase
    .from("cron_health")
    .select("*")
    .limit(200);

  // merge known crons with health data
  const byName = new Map<string, Record<string, unknown>>();
  for (const row of health ?? []) {
    const name =
      (row.jobname as string | undefined) ??
      (row.name as string | undefined) ??
      "";
    if (name) byName.set(name, row);
  }

  const merged = KNOWN_CRONS.map((c) => ({
    ...c,
    health: byName.get(c.jobname) ?? null,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Cron Monitor</h1>
        <p className="text-muted-foreground">
          Zamanlanmis gorevleri izle ve manuel tetikle
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            {merged.length} aktif cron
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CronsList crons={merged} />
        </CardContent>
      </Card>
    </div>
  );
}
