import { createClient } from "@/lib/supabase/server";
import { StatsCard } from "@/components/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Activity, TrendingUp, Target } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const now = new Date();
  const d1 = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString();
  const d7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const d30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const results = await Promise.allSettled([
    supabase
      .from("profiller")
      .select("*", { count: "exact", head: true })
      .gte("son_giris_tarihi", d1),
    supabase
      .from("profiller")
      .select("*", { count: "exact", head: true })
      .gte("son_giris_tarihi", d7),
    supabase
      .from("profiller")
      .select("*", { count: "exact", head: true })
      .gte("son_giris_tarihi", d30),
    supabase.from("profiller").select("*", { count: "exact", head: true }),
  ]);

  const val = (i: number) =>
    results[i].status === "fulfilled"
      ? (results[i] as PromiseFulfilledResult<{ count: number | null }>).value
          .count ?? 0
      : 0;

  const dau = val(0);
  const wau = val(1);
  const mau = val(2);
  const total = val(3);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Kullanici aktivitesi ve basari metrikleri
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="DAU"
          value={dau.toLocaleString("tr-TR")}
          icon={Users}
          subtitle="son 24 saat"
          accent="success"
        />
        <StatsCard
          title="WAU"
          value={wau.toLocaleString("tr-TR")}
          icon={Activity}
          subtitle="son 7 gun"
        />
        <StatsCard
          title="MAU"
          value={mau.toLocaleString("tr-TR")}
          icon={TrendingUp}
          subtitle="son 30 gun"
        />
        <StatsCard
          title="Toplam Kayit"
          value={total.toLocaleString("tr-TR")}
          icon={Target}
          accent="default"
        />
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Iskelet</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            TODO: retention kohortlari (D1/D7/D30), puan dagilim grafigi, lig
            bazli aktivite heatmap.
          </p>
          <p>
            Recharts ile gunluk aktif kullanici grafigi, mac-oncu vs canli
            tahmin basari karsilastirmasi.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
