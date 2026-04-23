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

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("yorum_raporlari")
    .select("*")
    .order("olusturulma_tarihi", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Rapor Edilen Yorumlar</h1>
        <p className="text-muted-foreground">
          yorum_raporlari tablosundan son kayitlar
        </p>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Yorum ID</TableHead>
              <TableHead>Sebep</TableHead>
              <TableHead>Raporlayan</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead>Tarih</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!data || data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  Rapor yok
                </TableCell>
              </TableRow>
            ) : (
              data.map((r) => (
                <TableRow key={String(r.id)}>
                  <TableCell className="font-mono text-xs">
                    {String(r.yorum_id)}
                  </TableCell>
                  <TableCell>{(r.sebep as string) ?? "-"}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {String(r.raporlayan_id ?? "-").slice(0, 8)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {(r.durum as string) ?? "acik"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {r.olusturulma_tarihi
                      ? new Date(
                          r.olusturulma_tarihi as string,
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
        TODO: onayla / reddet / yorumu sil eylemleri.
      </p>
    </div>
  );
}
