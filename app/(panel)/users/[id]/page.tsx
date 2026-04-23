import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { UserEditForm } from "./_user-edit-form";

export const dynamic = "force-dynamic";

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: user } = await supabase
    .from("profiller")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!user) notFound();

  const { data: predictions } = await supabase
    .from("tahmin_sonuclari")
    .select("id, mac_id, tahmin_turu, oran, sonuc, olusturulma_tarihi")
    .eq("kullanici_id", id)
    .order("olusturulma_tarihi", { ascending: false })
    .limit(20);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/users">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {user.kullanici_adi ?? user.email ?? "Kullanici"}
          </h1>
          <p className="text-muted-foreground text-sm font-mono">{user.id}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Profil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span className="font-mono">{user.email ?? "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Kullanici Adi</span>
              <span>{user.kullanici_adi ?? "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Puan</span>
              <span className="font-mono">{user.puan ?? 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Rutbe</span>
              {user.rutbe ? (
                <Badge variant="secondary">{user.rutbe}</Badge>
              ) : (
                <span>-</span>
              )}
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Kayit</span>
              <span>
                {user.olusturulma_tarihi
                  ? new Date(user.olusturulma_tarihi).toLocaleString("tr-TR")
                  : "-"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Son Giris</span>
              <span>
                {user.son_giris_tarihi
                  ? new Date(user.son_giris_tarihi).toLocaleString("tr-TR")
                  : "-"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Duzenle</CardTitle>
          </CardHeader>
          <CardContent>
            <UserEditForm
              id={user.id as string}
              initial={{
                kullanici_adi: user.kullanici_adi ?? "",
                puan: (user.puan as number | null) ?? 0,
                rutbe: (user.rutbe as string | null) ?? "",
              }}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Son 20 Tahmin
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!predictions || predictions.length === 0 ? (
            <p className="text-sm text-muted-foreground">Tahmin bulunamadi.</p>
          ) : (
            <ul className="space-y-2">
              {predictions.map((p) => (
                <li
                  key={p.id as string}
                  className="flex items-center justify-between text-sm border-b pb-2 last:border-0"
                >
                  <div>
                    <span className="font-mono text-xs text-muted-foreground">
                      #{(p.mac_id as string | number) ?? "?"}
                    </span>{" "}
                    <span>{p.tahmin_turu as string}</span>
                    {p.oran != null && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        {(p.oran as number).toFixed(2)}
                      </span>
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
