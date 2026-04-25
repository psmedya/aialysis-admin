import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { StatsCard } from "@/components/stats-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Activity,
  Users2,
  Bandage,
  ShieldAlert,
  Flag,
  Database,
  Clock3,
  Network,
} from "lucide-react";
import { CoverageAutoRefresh } from "./_auto-refresh";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// ---- helpers ---------------------------------------------------------------

type CountQuery = ReturnType<
  ReturnType<ReturnType<typeof createAdminClient>["from"]>["select"]
>;

async function safeCount(
  client: ReturnType<typeof createAdminClient>,
  table: string,
  builder?: (q: CountQuery) => CountQuery,
): Promise<number> {
  try {
    let q = client
      .from(table)
      .select("*", { count: "exact", head: true }) as CountQuery;
    if (builder) q = builder(q);
    const { count, error } = await q;
    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}

// ---- A. Dakikalik veri kapsami --------------------------------------------

type LigKapsam = {
  lig_id: number;
  lig_adi: string;
  ftCount: number;
  scrapedFixtures: number;
  pct: number;
};

async function fetchDakikalikKapsam(
  client: ReturnType<typeof createAdminClient>,
): Promise<{
  toplamSatir: number;
  distinctFixture: number;
  ligler: LigKapsam[];
}> {
  // Toplam satir + distinct fixture (mac_dakikalik_stat)
  const [{ count: toplamSatir }, fixtureSample] = await Promise.all([
    client
      .from("mac_dakikalik_stat")
      .select("*", { count: "exact", head: true }),
    // distinct fixture_id elde etmek icin sample cek (PostgREST distinct yok)
    client
      .from("mac_dakikalik_stat")
      .select("fixture_id")
      .limit(50000),
  ]);

  const distinctFixturesSet = new Set<number>();
  for (const row of fixtureSample.data ?? []) {
    if (row.fixture_id != null) distinctFixturesSet.add(row.fixture_id);
  }

  // FT maclari lig bazinda — ev_takim_adi vs FT olanlar
  // Lig listesi: maclar.lig_id + lig_adi distinct (sample)
  const { data: maclarSample } = await client
    .from("maclar")
    .select("lig_id, lig_adi, fixture_id, durum")
    .eq("durum", "FT")
    .limit(50000);

  // Lig bazinda FT count
  const ftByLig = new Map<number, { lig_adi: string; fixtures: Set<number> }>();
  for (const r of maclarSample ?? []) {
    if (r.lig_id == null) continue;
    const cur = ftByLig.get(r.lig_id) ?? {
      lig_adi: r.lig_adi ?? `lig-${r.lig_id}`,
      fixtures: new Set<number>(),
    };
    cur.fixtures.add(r.fixture_id as number);
    ftByLig.set(r.lig_id, cur);
  }

  // Lig bazinda scraped fixture sayisi: dakikalik stat'ta hangi fixture'larin oldugu
  const scrapedFixtures = distinctFixturesSet;

  // Hangi fixture hangi lige ait: maclarSample'dan map
  const fixtureToLig = new Map<number, number>();
  for (const r of maclarSample ?? []) {
    if (r.fixture_id != null && r.lig_id != null) {
      fixtureToLig.set(r.fixture_id as number, r.lig_id);
    }
  }

  const scrapedByLig = new Map<number, number>();
  for (const f of scrapedFixtures) {
    const lig = fixtureToLig.get(f);
    if (lig == null) continue;
    scrapedByLig.set(lig, (scrapedByLig.get(lig) ?? 0) + 1);
  }

  const ligler: LigKapsam[] = Array.from(ftByLig.entries()).map(
    ([lig_id, { lig_adi, fixtures }]) => {
      const ftCount = fixtures.size;
      const scraped = scrapedByLig.get(lig_id) ?? 0;
      const pct = ftCount > 0 ? Math.round((scraped / ftCount) * 1000) / 10 : 0;
      return { lig_id, lig_adi, ftCount, scrapedFixtures: scraped, pct };
    },
  );
  ligler.sort((a, b) => b.pct - a.pct || b.ftCount - a.ftCount);

  return {
    toplamSatir: toplamSatir ?? 0,
    distinctFixture: distinctFixturesSet.size,
    ligler,
  };
}

function pctBadge(pct: number) {
  if (pct >= 100)
    return (
      <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20">
        %{pct.toFixed(1)}
      </Badge>
    );
  if (pct >= 50)
    return (
      <Badge className="bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20">
        %{pct.toFixed(1)}
      </Badge>
    );
  if (pct >= 10)
    return (
      <Badge className="bg-orange-500/15 text-orange-400 border border-orange-500/30 hover:bg-orange-500/20">
        %{pct.toFixed(1)}
      </Badge>
    );
  return (
    <Badge className="bg-rose-500/15 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20">
      %{pct.toFixed(1)}
    </Badge>
  );
}

// ---- B. Oyuncu verisi -----------------------------------------------------

async function fetchOyuncuKapsam(
  client: ReturnType<typeof createAdminClient>,
) {
  const [oyuncu, sezon, sakat, sezonLigSample, takimSample] = await Promise.all(
    [
      safeCount(client, "oyuncular"),
      safeCount(client, "oyuncu_sezon_istat"),
      safeCount(client, "oyuncu_sakatlik"),
      client.from("oyuncu_sezon_istat").select("lig_id").limit(50000),
      client.from("oyuncular").select("takim_id").limit(50000),
    ],
  );

  const ligSet = new Set<number>();
  for (const r of sezonLigSample.data ?? []) {
    if (r.lig_id != null) ligSet.add(r.lig_id);
  }

  const takimMap = new Map<number, number>();
  for (const r of takimSample.data ?? []) {
    if (r.takim_id == null) continue;
    takimMap.set(r.takim_id, (takimMap.get(r.takim_id) ?? 0) + 1);
  }

  // top 10 takim id + oyuncu sayisi
  const topTakimIds = Array.from(takimMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // Takim isimlerini maclar tablosundan turetelim
  const ids = topTakimIds.map(([id]) => id);
  const takimAdMap = new Map<number, string>();
  if (ids.length > 0) {
    const { data: ev } = await client
      .from("maclar")
      .select("ev_takim_id, ev_takim_adi")
      .in("ev_takim_id", ids)
      .limit(2000);
    const { data: dep } = await client
      .from("maclar")
      .select("dep_takim_id, dep_takim_adi")
      .in("dep_takim_id", ids)
      .limit(2000);
    for (const r of ev ?? []) {
      if (r.ev_takim_id != null && r.ev_takim_adi)
        takimAdMap.set(r.ev_takim_id, r.ev_takim_adi);
    }
    for (const r of dep ?? []) {
      if (r.dep_takim_id != null && r.dep_takim_adi && !takimAdMap.has(r.dep_takim_id))
        takimAdMap.set(r.dep_takim_id, r.dep_takim_adi);
    }
  }

  return {
    oyuncu,
    sezon,
    sakat,
    distinctLig: ligSet.size,
    topTakimlar: topTakimIds.map(([id, cnt]) => ({
      takim_id: id,
      ad: takimAdMap.get(id) ?? `takim-${id}`,
      oyuncuSayisi: cnt,
    })),
  };
}

// ---- C. Hakem verisi ------------------------------------------------------

async function fetchHakemKapsam(
  client: ReturnType<typeof createAdminClient>,
) {
  const [hakem, sezon] = await Promise.all([
    safeCount(client, "hakemler"),
    safeCount(client, "hakem_sezon_istat"),
  ]);

  // En yogun 5 hakem (mac_sayisi DESC, sezon DESC)
  const { data: top } = await client
    .from("hakem_sezon_istat")
    .select(
      "hakem_id, sezon, lig_id, mac_sayisi, ortalama_sari, ortalama_kirmizi",
    )
    .order("mac_sayisi", { ascending: false })
    .limit(5);

  // Hakem adlarini cek
  const ids = (top ?? []).map((r) => r.hakem_id).filter(Boolean) as number[];
  const adMap = new Map<number, string>();
  if (ids.length > 0) {
    const { data: hk } = await client
      .from("hakemler")
      .select("hakem_id, ad")
      .in("hakem_id", ids);
    for (const h of hk ?? []) {
      if (h.hakem_id != null) adMap.set(h.hakem_id, h.ad ?? `hakem-${h.hakem_id}`);
    }
  }

  // Histogram: ortalama_sari dagilimi (0-2, 2-3, 3-4, 4-5, 5+)
  const { data: dagilim } = await client
    .from("hakem_sezon_istat")
    .select("ortalama_sari, ortalama_kirmizi")
    .limit(50000);

  const buckets = [0, 0, 0, 0, 0]; // 0-2, 2-3, 3-4, 4-5, 5+
  let kirmiziTopl = 0;
  let kirmiziCount = 0;
  for (const r of dagilim ?? []) {
    const s = Number(r.ortalama_sari ?? 0);
    if (s < 2) buckets[0]++;
    else if (s < 3) buckets[1]++;
    else if (s < 4) buckets[2]++;
    else if (s < 5) buckets[3]++;
    else buckets[4]++;

    const k = Number(r.ortalama_kirmizi ?? 0);
    if (!Number.isNaN(k)) {
      kirmiziTopl += k;
      kirmiziCount++;
    }
  }

  return {
    hakem,
    sezon,
    enYogun: (top ?? []).map((r) => ({
      hakem_id: r.hakem_id as number,
      ad: adMap.get(r.hakem_id as number) ?? `hakem-${r.hakem_id}`,
      sezon: r.sezon as number,
      lig_id: r.lig_id as number,
      mac_sayisi: r.mac_sayisi as number,
      ortalama_sari: Number(r.ortalama_sari ?? 0),
      ortalama_kirmizi: Number(r.ortalama_kirmizi ?? 0),
    })),
    sariBuckets: buckets,
    ortKirmizi: kirmiziCount > 0 ? kirmiziTopl / kirmiziCount : 0,
    histToplam: dagilim?.length ?? 0,
  };
}

// ---- D. API kullanimi -----------------------------------------------------

async function fetchApiKullanim(
  client: ReturnType<typeof createAdminClient>,
) {
  const son24 = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const son1 = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const [scrapeSon24, scrapeBasari, scrapeFail, macSon1] = await Promise.all([
    safeCount(client, "scrape_log", (q) => q.gte("scraped_at", son24)),
    safeCount(client, "scrape_log", (q) =>
      q.gte("scraped_at", son24).eq("durum", "success"),
    ),
    safeCount(client, "scrape_log", (q) =>
      q.gte("scraped_at", son24).neq("durum", "success"),
    ),
    safeCount(client, "maclar", (q) => q.gte("updated_at", son1)),
  ]);

  // Toplam credit harcamasi (ScrapingBee) son 24 saat
  const { data: creditRows } = await client
    .from("scrape_log")
    .select("credit_harcandi")
    .gte("scraped_at", son24)
    .limit(50000);
  const toplamCredit = (creditRows ?? []).reduce(
    (sum, r) => sum + (Number(r.credit_harcandi) || 0),
    0,
  );

  return {
    scrapeSon24,
    scrapeBasari,
    scrapeFail,
    macSon1,
    toplamCredit,
  };
}

// ---- E. Cron sagligi ------------------------------------------------------

async function fetchCronSaglik(
  client: ReturnType<typeof createAdminClient>,
) {
  // pg_cron public schema'da gozukmuyor; cron_health tablosu da yok.
  // RPC fonksiyonu varsa cagiriyoruz; yoksa null donuyor.
  try {
    const { data, error } = await client.rpc("admin_cron_health");
    if (error) return null;
    return (data as Record<string, unknown>[]) ?? null;
  } catch {
    return null;
  }
}

// ---- Page -----------------------------------------------------------------

export default async function VeriKapsamPage() {
  // Service role tercih, yoksa cookie SSR client.
  let client: ReturnType<typeof createAdminClient>;
  try {
    client = createAdminClient();
  } catch {
    // Service role key yoksa (lokal dev), SSR client'i admin tip uyumu icin cast'le.
    client = (await createClient()) as unknown as ReturnType<
      typeof createAdminClient
    >;
  }

  const [dakikalik, oyuncu, hakem, api, cron] = await Promise.all([
    fetchDakikalikKapsam(client),
    fetchOyuncuKapsam(client),
    fetchHakemKapsam(client),
    fetchApiKullanim(client),
    fetchCronSaglik(client),
  ]);

  const top7 = dakikalik.ligler.slice(0, 7);
  const digerler = dakikalik.ligler.slice(7);

  const sariEtiketler = ["0-2", "2-3", "3-4", "4-5", "5+"];
  const histMax = Math.max(1, ...hakem.sariBuckets);

  return (
    <div className="space-y-6">
      <CoverageAutoRefresh seconds={60} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Veri Kapsam</h1>
          <p className="text-muted-foreground">
            Sunucu-merkezli veri tabaninin canli kapsam metrikleri (60s otomatik
            yenileme)
          </p>
        </div>
      </div>

      {/* Ust ozet kartlari */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        <StatsCard
          title="Dakikalik Satir"
          value={dakikalik.toplamSatir.toLocaleString("tr-TR")}
          icon={Activity}
          subtitle={`${dakikalik.distinctFixture.toLocaleString("tr-TR")} farkli mac`}
          accent="default"
        />
        <StatsCard
          title="Oyuncu"
          value={oyuncu.oyuncu.toLocaleString("tr-TR")}
          icon={Users2}
          accent="success"
        />
        <StatsCard
          title="Sezon Istat"
          value={oyuncu.sezon.toLocaleString("tr-TR")}
          icon={Database}
          subtitle={`${oyuncu.distinctLig} farkli lig`}
        />
        <StatsCard
          title="Sakatlik"
          value={oyuncu.sakat.toLocaleString("tr-TR")}
          icon={Bandage}
          accent="warning"
        />
        <StatsCard
          title="Hakem"
          value={hakem.hakem.toLocaleString("tr-TR")}
          icon={Flag}
        />
        <StatsCard
          title="Hakem Sezon"
          value={hakem.sezon.toLocaleString("tr-TR")}
          icon={ShieldAlert}
          accent="default"
        />
      </div>

      {/* A. Dakikalik kapsam tablosu */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Dakikalik Veri Kapsami (Lig Bazinda)
          </CardTitle>
          <CardDescription>
            FT olan macin scrape edilme orani — kapsam azalan siralama
          </CardDescription>
        </CardHeader>
        <CardContent>
          {top7.length > 0 && (
            <>
              <div className="text-xs text-muted-foreground mb-2">
                En iyi 7 lig
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lig</TableHead>
                    <TableHead className="text-right">FT Mac</TableHead>
                    <TableHead className="text-right">Scrape</TableHead>
                    <TableHead className="text-right">Kapsam</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {top7.map((l) => (
                    <TableRow key={l.lig_id}>
                      <TableCell className="font-medium">
                        <span className="text-muted-foreground text-xs mr-2">
                          #{l.lig_id}
                        </span>
                        {l.lig_adi}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {l.ftCount.toLocaleString("tr-TR")}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {l.scrapedFixtures.toLocaleString("tr-TR")}
                      </TableCell>
                      <TableCell className="text-right">
                        {pctBadge(l.pct)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}

          {digerler.length > 0 && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                Diger {digerler.length} lig
              </summary>
              <div className="mt-2 max-h-96 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lig</TableHead>
                      <TableHead className="text-right">FT Mac</TableHead>
                      <TableHead className="text-right">Scrape</TableHead>
                      <TableHead className="text-right">Kapsam</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {digerler.map((l) => (
                      <TableRow key={l.lig_id}>
                        <TableCell className="font-medium">
                          <span className="text-muted-foreground text-xs mr-2">
                            #{l.lig_id}
                          </span>
                          {l.lig_adi}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {l.ftCount.toLocaleString("tr-TR")}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {l.scrapedFixtures.toLocaleString("tr-TR")}
                        </TableCell>
                        <TableCell className="text-right">
                          {pctBadge(l.pct)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </details>
          )}

          {dakikalik.ligler.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Lig bazinda kapsam verisi okunamadi.
            </p>
          )}
        </CardContent>
      </Card>

      {/* B. En aktif takimlar */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users2 className="h-4 w-4" />
              En Aktif Takim Kadrolari (Top 10)
            </CardTitle>
            <CardDescription>
              Oyuncu sayisina gore (oyuncular tablosu)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {oyuncu.topTakimlar.length === 0 ? (
              <p className="text-sm text-muted-foreground">Veri bulunamadi.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Takim</TableHead>
                    <TableHead className="text-right">Oyuncu</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {oyuncu.topTakimlar.map((t) => (
                    <TableRow key={t.takim_id}>
                      <TableCell className="font-medium">
                        <span className="text-muted-foreground text-xs mr-2">
                          #{t.takim_id}
                        </span>
                        {t.ad}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {t.oyuncuSayisi.toLocaleString("tr-TR")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* C. En yogun hakemler */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flag className="h-4 w-4" />
              En Yogun Hakemler (Top 5)
            </CardTitle>
            <CardDescription>Mac sayisina gore — sezon bazinda</CardDescription>
          </CardHeader>
          <CardContent>
            {hakem.enYogun.length === 0 ? (
              <p className="text-sm text-muted-foreground">Veri bulunamadi.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hakem</TableHead>
                    <TableHead className="text-right">Mac</TableHead>
                    <TableHead className="text-right">Ort. Sari</TableHead>
                    <TableHead className="text-right">Ort. Kirmizi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hakem.enYogun.map((h) => (
                    <TableRow key={`${h.hakem_id}-${h.sezon}-${h.lig_id}`}>
                      <TableCell className="font-medium">
                        {h.ad}
                        <span className="block text-xs text-muted-foreground">
                          sezon {h.sezon} · lig #{h.lig_id}
                        </span>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {h.mac_sayisi.toLocaleString("tr-TR")}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {h.ortalama_sari.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {h.ortalama_kirmizi.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* C2. Sari kart histogram */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" />
            Hakem Ortalama Sari Kart Dagilimi
          </CardTitle>
          <CardDescription>
            {hakem.histToplam.toLocaleString("tr-TR")} sezon kaydi · ortalama
            kirmizi {hakem.ortKirmizi.toFixed(2)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {sariEtiketler.map((label, i) => {
              const v = hakem.sariBuckets[i];
              const w = Math.max(2, Math.round((v / histMax) * 100));
              return (
                <div key={label} className="flex items-center gap-3 text-sm">
                  <div className="w-16 text-muted-foreground">{label}</div>
                  <div className="flex-1 h-3 bg-muted rounded">
                    <div
                      className="h-3 bg-primary rounded"
                      style={{ width: `${w}%` }}
                    />
                  </div>
                  <div className="w-20 text-right tabular-nums">
                    {v.toLocaleString("tr-TR")}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* D. API kullanimi */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="ScrapingBee Son 24sa"
          value={api.scrapeSon24.toLocaleString("tr-TR")}
          icon={Network}
          subtitle={`${api.scrapeBasari} basarili · ${api.scrapeFail} hata`}
          accent={api.scrapeFail > 50 ? "destructive" : "success"}
        />
        <StatsCard
          title="Toplam Credit"
          value={api.toplamCredit.toLocaleString("tr-TR")}
          icon={Database}
          subtitle="son 24 saat"
        />
        <StatsCard
          title="API-Football Son 1sa"
          value={api.macSon1.toLocaleString("tr-TR")}
          icon={Clock3}
          subtitle="maclar.updated_at"
          accent="default"
        />
        <StatsCard
          title="Cron Saglik"
          value={cron == null ? "RPC yok" : `${cron.length} kayit`}
          icon={Clock3}
          subtitle={cron == null ? "admin_cron_health bulunamadi" : "ok"}
          accent={cron == null ? "warning" : "success"}
        />
      </div>

      {/* E. Cron RPC ciktisi (opsiyonel) */}
      {cron && cron.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock3 className="h-4 w-4" />
              Cron Saglik (admin_cron_health)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Son durum</TableHead>
                  <TableHead className="text-right">Fail oranı</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cron.slice(0, 30).map((c, i) => {
                  const failRate = Number(
                    (c.fail_rate as number | undefined) ??
                      (c.failure_rate as number | undefined) ??
                      0,
                  );
                  return (
                    <TableRow key={i}>
                      <TableCell className="font-medium">
                        {(c.jobname as string) ?? (c.name as string) ?? "?"}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {(c.schedule as string) ?? "-"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            (c.status as string)?.toLowerCase() === "ok" ||
                            (c.status as string)?.toLowerCase() === "succeeded"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {(c.status as string) ?? "?"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {(failRate * 100).toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
