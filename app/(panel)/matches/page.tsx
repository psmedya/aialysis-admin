import { createClient } from "@/lib/supabase/server";
import { MatchesTable } from "./_matches-table";

export const dynamic = "force-dynamic";

export default async function MatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; durum?: string; lig?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("maclar")
    .select(
      "fixture_id, ev_takim_adi, dep_takim_adi, lig_adi, durum, mac_tarihi, ev_gol, dep_gol",
      { count: "exact" },
    )
    .order("mac_tarihi", { ascending: false })
    .limit(100);

  if (params.q) {
    query = query.or(
      `ev_takim_adi.ilike.%${params.q}%,dep_takim_adi.ilike.%${params.q}%`,
    );
  }
  if (params.durum) query = query.eq("durum", params.durum);
  if (params.lig) query = query.eq("lig_adi", params.lig);

  const { data, count, error } = await query;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Maclar</h1>
        <p className="text-muted-foreground">
          {count !== null ? `${count} mac` : "Mac listesi"}
        </p>
      </div>
      {error && (
        <div className="text-sm text-destructive">Hata: {error.message}</div>
      )}
      <MatchesTable rows={data ?? []} />
    </div>
  );
}
