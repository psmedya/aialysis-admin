import { createClient } from "@/lib/supabase/server";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Flag } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ForumPage() {
  const supabase = await createClient();
  const { data: yorumlar } = await supabase
    .from("forum_yorumlari")
    .select("id, icerik, kullanici_id, olusturulma_tarihi, gizli, rapor_sayisi")
    .order("olusturulma_tarihi", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Forum</h1>
          <p className="text-muted-foreground">
            Son yorumlar ve moderasyon
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/forum/reports">
            <Flag className="h-4 w-4 mr-2" /> Rapor edilenler
          </Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Icerik</TableHead>
              <TableHead>Kullanici</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead>Rapor</TableHead>
              <TableHead>Tarih</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!yorumlar || yorumlar.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  Yorum bulunamadi
                </TableCell>
              </TableRow>
            ) : (
              yorumlar.map((y) => (
                <TableRow key={String(y.id)}>
                  <TableCell className="max-w-md truncate">
                    {(y.icerik as string) ?? "-"}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {String(y.kullanici_id ?? "-").slice(0, 8)}
                  </TableCell>
                  <TableCell>
                    {y.gizli ? (
                      <Badge variant="destructive">Gizli</Badge>
                    ) : (
                      <Badge variant="secondary">Aktif</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {(y.rapor_sayisi as number | null) ?? 0}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {y.olusturulma_tarihi
                      ? new Date(
                          y.olusturulma_tarihi as string,
                        ).toLocaleString("tr-TR")
                      : "-"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground">
        TODO: yorum silme, kullanici ban, toplu moderasyon.
      </p>
    </div>
  );
}
