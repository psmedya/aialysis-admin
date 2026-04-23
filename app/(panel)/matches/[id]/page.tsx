import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MatchEditForm } from "./_match-edit-form";

export const dynamic = "force-dynamic";

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const fixtureId = Number(id);
  if (!Number.isFinite(fixtureId)) notFound();

  const supabase = await createClient();
  const { data: match } = await supabase
    .from("maclar")
    .select("*")
    .eq("fixture_id", fixtureId)
    .maybeSingle();

  if (!match) notFound();

  const { data: predictions } = await supabase
    .from("tahmin_sonuclari")
    .select("id, tahmin, kategori, oran, sonuc, kaynak, created_at")
    .eq("mac_id", fixtureId)
    .order("created_at", { ascending: false })
    .limit(30);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/matches">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {match.ev_takim_adi as string} vs {match.dep_takim_adi as string}
          </h1>
          <p className="text-muted-foreground text-sm">
            {match.lig_adi as string} ·{" "}
            {match.mac_tarihi
              ? new Date(match.mac_tarihi as string).toLocaleString("tr-TR")
              : "-"}
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Mac Bilgisi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fixture ID</span>
              <span className="font-mono">{String(match.fixture_id)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Skor</span>
              <span className="font-mono">
                {(match.ev_gol as number | null) ?? "-"} :{" "}
                {(match.dep_gol as number | null) ?? "-"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Durum</span>
              <Badge>{(match.durum as string) ?? "-"}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Elapsed</span>
              <span className="font-mono">
                {(match.elapsed as number | null) ?? "-"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Stadyum</span>
              <span className="text-xs">
                {(match.stadyum as string) ?? "-"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Override</CardTitle>
          </CardHeader>
          <CardContent>
            <MatchEditForm
              id={String(match.fixture_id)}
              initial={{
                durum: (match.durum as string) ?? "",
                ev_skor: (match.ev_gol as number | null) ?? null,
                dep_skor: (match.dep_gol as number | null) ?? null,
              }}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Mac Tahminleri</CardTitle>
        </CardHeader>
        <CardContent>
          {!predictions || predictions.length === 0 ? (
            <p className="text-sm text-muted-foreground">Tahmin yok.</p>
          ) : (
            <ul className="space-y-2">
              {predictions.map((p) => (
                <li
                  key={String(p.id)}
                  className="flex items-center justify-between text-sm border-b pb-2 last:border-0"
                >
                  <div>
                    <span>
                      {(p.tahmin as string) ?? (p.kategori as string) ?? "-"}
                    </span>
                    {p.oran != null && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        {(p.oran as number).toFixed(2)}
                      </span>
                    )}
                    {p.kaynak && (
                      <Badge variant="outline" className="ml-2 text-[10px]">
                        {p.kaynak as string}
                      </Badge>
                    )}
                  </div>
                  <Badge
                    variant={
                      p.sonuc === "DOGRU"
                        ? "secondary"
                        : p.sonuc === "YANLIS"
                          ? "destructive"
                          : "outline"
                    }
                  >
                    {(p.sonuc as string) ?? "BEKLIYOR"}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
