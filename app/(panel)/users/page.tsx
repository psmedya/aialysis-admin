import { createClient } from "@/lib/supabase/server";
import { UsersTable } from "./_users-table";

export const dynamic = "force-dynamic";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; rutbe?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("profiller")
    .select(
      "user_id, kullanici_adi, puan, rutbe, kayit_tarihi, updated_at, tahmin_dogru, tahmin_yanlis",
      { count: "exact" },
    )
    .order("kayit_tarihi", { ascending: false })
    .limit(100);

  if (params.q) {
    query = query.ilike("kullanici_adi", `%${params.q}%`);
  }
  if (params.rutbe) {
    query = query.eq("rutbe", params.rutbe);
  }

  const { data, error, count } = await query;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Kullanicilar</h1>
        <p className="text-muted-foreground">
          {count !== null ? `Toplam ${count} kullanici` : "Kullanici listesi"}
        </p>
      </div>

      {error && (
        <div className="text-sm text-destructive">Hata: {error.message}</div>
      )}

      <UsersTable initialRows={data ?? []} />
    </div>
  );
}
