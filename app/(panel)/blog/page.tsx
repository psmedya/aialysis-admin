import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_yazilari")
    .select("id, baslik, slug, yayinlandi, olusturulma_tarihi")
    .order("olusturulma_tarihi", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Blog</h1>
          <p className="text-muted-foreground">Blog yazilari yonetimi</p>
        </div>
        <Button asChild>
          <Link href="/blog/new">
            <Plus className="h-4 w-4 mr-2" /> Yeni yazi
          </Link>
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Baslik</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead>Tarih</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!data || data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  Yazi yok
                </TableCell>
              </TableRow>
            ) : (
              data.map((p) => (
                <TableRow key={String(p.id)}>
                  <TableCell className="font-medium">
                    {(p.baslik as string) ?? "-"}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {(p.slug as string) ?? "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={p.yayinlandi ? "secondary" : "outline"}>
                      {p.yayinlandi ? "Yayinda" : "Taslak"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {p.olusturulma_tarihi
                      ? new Date(
                          p.olusturulma_tarihi as string,
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
        TODO: inline edit, sil, yayinla toggle.
      </p>
    </div>
  );
}
