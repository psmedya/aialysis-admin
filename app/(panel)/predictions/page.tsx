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
      "id, mac_id, tahmin_turu, oran, sonuc, kaynak, olusturulma_tarihi",
      { count: "exact" },
    )
    .order("olusturulma_tarihi", { ascending: false })
    .limit(100);

  if (p.sonuc && p.sonuc !== "all") query = query.eq("sonuc", p.sonuc);
  if (p.kaynak && p.kaynak !== "all") query = query.eq("kaynak", p.kaynak);

  const { data, count, error } = await query;

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
      <PredictionsTable rows={data ?? []} />
    </div>
  );
}
