import { createClient } from "@/lib/supabase/server";
import { StatsCard } from "@/components/stats-card";
import {
  Users,
  Trophy,
  Target,
  Radio,
  Clock,
  Percent,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardChart } from "./_components/dashboard-chart";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function fetchStats() {
  const supabase = await createClient();

  const counts = await Promise.allSettled([
    supabase.from("profiller").select("*", { count: "exact", head: true }),
    // DAU: son 24 saatte guncellenen profiller (updated_at proxy)
    supabase
      .from("profiller")
      .select("*", { count: "exact", head: true })
      .gte(
        "updated_at",
        new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      ),
    supabase.from("tahmin_sonuclari").select("*", { count: "exact", head: true }),
    supabase
      .from("tahmin_sonuclari")
      .select("*", { count: "exact", head: true })
      .eq("sonuc", "DOGRU"),
    supabase
      .from("maclar")
      .select("*", { count: "exact", head: true })
      .in("durum", ["1H", "2H", "HT", "ET", "BT", "P", "LIVE"]),
  ]);

  const val = (i: number) =>
    counts[i].status === "fulfilled"
      ? (counts[i] as PromiseFulfilledResult<{ count: number | null }>).value
          .count ?? 0
      : 0;

  const totalUsers = val(0);
  const dauUsers = val(1);
  const totalPredictions = val(2);
  const correctPredictions = val(3);
  const liveMatches = val(4);

  const successRate =
    totalPredictions > 0
      ? Math.round((correctPredictions / totalPredictions) * 1000) / 10
      : 0;

  return {
    totalUsers,
    dauUsers,
    totalPredictions,
    correctPredictions,
    liveMatches,
    successRate,
  };
}

async function fetchCronHealth() {
  // cron_health tablosu public semada yok — sessizce bos dondur
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("cron_health")
      .select("*")
      .limit(20);
    if (error) return [];
    return data ?? [];
  } catch {
    return [];
  }
}

async function fetchTrend() {
  const supabase = await createClient();
  const since = new Date();
  since.setDate(since.getDate() - 30);
  const { data } = await supabase
    .from("tahmin_sonuclari")
    .select("created_at, sonuc")
    .gte("created_at", since.toISOString())
    .limit(5000);

  const byDay = new Map<
    string,
    { date: string; total: number; dogru: number }
  >();
  for (const row of data ?? []) {
    const d = new Date(row.created_at as string);
    const key = d.toISOString().slice(0, 10);
    const entry = byDay.get(key) ?? { date: key, total: 0, dogru: 0 };
    entry.total += 1;
    if (row.sonuc === "DOGRU") entry.dogru += 1;
    byDay.set(key, entry);
  }
  const arr = Array.from(byDay.values())
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((r) => ({
      date: r.date.slice(5),
      total: r.total,
      basari: r.total ? Math.round((r.dogru / r.total) * 100) : 0,
    }));
  return arr;
}

export default async function DashboardPage() {
  const [stats, cronHealth, trend] = await Promise.all([
    fetchStats(),
    fetchCronHealth(),
    fetchTrend(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Sistem genel bakisi ve anahtar metrikler
          </p>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatsCard
          title="Toplam Kullanici"
          value={stats.totalUsers.toLocaleString("tr-TR")}
          icon={Users}
          accent="default"
        />
        <StatsCard
          title="Bugun Aktif"
          value={stats.dauUsers.toLocaleString("tr-TR")}
          icon={Users}
          subtitle="son 24 saat"
          accent="success"
        />
        <StatsCard
          title="Toplam Tahmin"
          value={stats.totalPredictions.toLocaleString("tr-TR")}
          icon={Trophy}
        />
        <StatsCard
          title="Dogru Tahmin"
          value={stats.correctPredictions.toLocaleString("tr-TR")}
          icon={Target}
          accent="success"
        />
        <StatsCard
          title="Basari Orani"
          value={`%${stats.successRate}`}
          icon={Percent}
          accent="warning"
        />
        <StatsCard
          title="Canli Mac"
          value={stats.liveMatches}
          icon={Radio}
          accent="destructive"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Son 30 Gun Trend</CardTitle>
            <CardDescription>
              Gunluk tahmin sayisi ve basari orani
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <DashboardChart data={trend} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Cron Saglik
            </CardTitle>
            <CardDescription>Son calisma durumlari</CardDescription>
          </CardHeader>
          <CardContent>
            {cronHealth.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                cron_health tablosu bulunamadi veya bos.
              </p>
            ) : (
              <ul className="space-y-2">
                {cronHealth.slice(0, 12).map((c, i) => {
                  const healthy =
                    (c.status as string | undefined)?.toLowerCase() ===
                      "succeeded" ||
                    (c.status as string | undefined)?.toLowerCase() ===
                      "healthy" ||
                    (c.status as string | undefined)?.toLowerCase() === "ok";
                  return (
                    <li
                      key={i}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="truncate">
                        {(c.jobname as string) ??
                          (c.name as string) ??
                          `cron-${i}`}
                      </span>
                      <Badge
                        variant={healthy ? "secondary" : "destructive"}
                        className="font-mono"
                      >
                        {(c.status as string) ?? "?"}
                      </Badge>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
