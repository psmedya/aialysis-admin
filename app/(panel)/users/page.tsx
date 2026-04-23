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
      "id, email, kullanici_adi, puan, rutbe, olusturulma_tarihi, son_giris_tarihi",
      { count: "exact" },
    )
    .order("olusturulma_tarihi", { ascending: false })
    .limit(100);

  if (params.q) {
    query = query.or(
      `email.ilike.%${params.q}%,kullanici_adi.ilike.%${params.q}%`,
    );
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
