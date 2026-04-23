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
  // cron_health tablosu public semada yok — health verisi bos
  // Cron job listesini pg_cron'dan almak icin RPC/SECURITY DEFINER gerekli.
  // Simdilik bilinen cron listesini sergiler ve manuel tetikleme saglar.
  const merged = KNOWN_CRONS.map((c) => ({
    ...c,
    health: null as Record<string, unknown> | null,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Cron Monitor</h1>
        <p className="text-muted-foreground">
          Zamanlanmis gorevleri izle ve manuel tetikle
        </p>
      </div>
      <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-200">
        Not: cron_health tablosu bulunmadigindan son calisma bilgileri
        gosterilmiyor. Tetikleme calisir.
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            {merged.length} bilinen cron
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CronsList crons={merged} />
        </CardContent>
      </Card>
    </div>
  );
}
