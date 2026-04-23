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
  const { data, error } = await supabase
    .from("yorum_raporlari")
    .select("id, yorum_id, rapor_eden, sebep, aciklama, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Rapor Edilen Yorumlar
        </h1>
        <p className="text-muted-foreground">
          yorum_raporlari tablosundan son kayitlar
        </p>
      </div>
      {error && (
        <div className="text-sm text-destructive">Hata: {error.message}</div>
      )}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Yorum ID</TableHead>
              <TableHead>Sebep</TableHead>
              <TableHead>Raporlayan</TableHead>
              <TableHead>Aciklama</TableHead>
              <TableHead>Tarih</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!data || data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  Rapor yok
                </TableCell>
              </TableRow>
            ) : (
              data.map((r) => (
                <TableRow key={String(r.id)}>
                  <TableCell className="font-mono text-xs">
                    {String(r.yorum_id)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {(r.sebep as string) ?? "-"}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {String(r.rapor_eden ?? "-").slice(0, 8)}
                  </TableCell>
                  <TableCell className="max-w-md truncate text-xs text-muted-foreground">
                    {(r.aciklama as string) ?? "-"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {r.created_at
                      ? new Date(r.created_at as string).toLocaleString("tr-TR")
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
