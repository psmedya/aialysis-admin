import { createClient } from "@/lib/supabase/server";
import { PredictionsTable } from "./_predictions-table";

export const dynamic = "force-dynamic";

export default async function PredictionsPage({
  searchParams,
}: {
  searchParams: Promise<{ sonuc?: string; kaynak?: string }>;
}) {
  const p = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("tahmin_sonuclari")
    .select(
      "id, mac_id, ev_sahibi, deplasman, tahmin, kategori, oran, sonuc, kaynak, created_at",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (p.sonuc && p.sonuc !== "all") query = query.eq("sonuc", p.sonuc);
  if (p.kaynak && p.kaynak !== "all") query = query.eq("kaynak", p.kaynak);

  const { data, count, error } = await query;

  const rows = (data ?? []).map((r) => ({
    id: r.id as string,
    mac_id: r.mac_id as string | number | null,
    ev_sahibi: r.ev_sahibi as string | null,
    deplasman: r.deplasman as string | null,
    tahmin_turu: (r.tahmin as string | null) ?? (r.kategori as string | null),
    oran: r.oran as number | null,
    sonuc: r.sonuc as string | null,
    kaynak: r.kaynak as string | null,
    olusturulma_tarihi: r.created_at as string | null,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tahminler</h1>
        <p className="text-muted-foreground">
          {count !== null ? `${count} tahmin` : "Tahmin listesi"}
        </p>
      </div>
      {error && (
        <div className="text-sm text-destructive">Hata: {error.message}</div>
      )}
      <PredictionsTable rows={rows} />
    </div>
  );
}
