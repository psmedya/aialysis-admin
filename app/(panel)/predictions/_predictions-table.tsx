"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2, MoreHorizontal, Trash2, Check, X } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

type PRow = {
  id: string | number;
  mac_id?: string | number | null;
  tahmin_turu?: string | null;
  oran?: number | null;
  sonuc?: string | null;
  kaynak?: string | null;
  olusturulma_tarihi?: string | null;
};

export function PredictionsTable({ rows: initial }: { rows: PRow[] }) {
  const router = useRouter();
  const sp = useSearchParams();
  const [rows, setRows] = useState(initial);
  const [sonuc, setSonuc] = useState(sp.get("sonuc") ?? "all");
  const [kaynak, setKaynak] = useState(sp.get("kaynak") ?? "all");
  const [isPending, startTransition] = useTransition();
  const [busy, setBusy] = useState<string | null>(null);

  function applyFilters(nS = sonuc, nK = kaynak) {
    const params = new URLSearchParams();
    if (nS !== "all") params.set("sonuc", nS);
    if (nK !== "all") params.set("kaynak", nK);
    startTransition(() => router.push(`/predictions?${params.toString()}`));
  }

  async function updateSonuc(id: string | number, newSonuc: string) {
    setBusy(String(id));
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("tahmin_sonuclari")
        .update({ sonuc: newSonuc })
        .eq("id", id);
      if (error) throw error;
      setRows((r) => r.map((x) => (x.id === id ? { ...x, sonuc: newSonuc } : x)));
      toast.success("Guncellendi");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Hata");
    } finally {
      setBusy(null);
    }
  }

  async function remove(id: string | number) {
    if (!confirm("Tahmin silinsin mi?")) return;
    setBusy(String(id));
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("tahmin_sonuclari")
        .delete()
        .eq("id", id);
      if (error) throw error;
      setRows((r) => r.filter((x) => x.id !== id));
      toast.success("Silindi");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Hata");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-3 flex-wrap">
        <Select
          value={sonuc}
          onValueChange={(v) => {
            setSonuc(v);
            applyFilters(v, kaynak);
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Sonuc" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tum sonuclar</SelectItem>
            <SelectItem value="DOGRU">DOGRU</SelectItem>
            <SelectItem value="YANLIS">YANLIS</SelectItem>
            <SelectItem value="BEKLIYOR">BEKLIYOR</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={kaynak}
          onValueChange={(v) => {
            setKaynak(v);
            applyFilters(sonuc, v);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Kaynak" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tum kaynaklar</SelectItem>
            <SelectItem value="mac-oncu-v2">mac-oncu-v2</SelectItem>
            <SelectItem value="canli">canli</SelectItem>
            <SelectItem value="gemini">gemini</SelectItem>
            <SelectItem value="groq">groq</SelectItem>
            <SelectItem value="ogrenme-motoru">ogrenme-motoru</SelectItem>
          </SelectContent>
        </Select>
        {isPending && <Loader2 className="h-4 w-4 animate-spin self-center" />}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mac</TableHead>
              <TableHead>Tahmin</TableHead>
              <TableHead className="text-right">Oran</TableHead>
              <TableHead>Kaynak</TableHead>
              <TableHead>Sonuc</TableHead>
              <TableHead>Tarih</TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  Kayit yok
                </TableCell>
              </TableRow>
            ) : (
              rows.map((p) => (
                <TableRow key={String(p.id)} data-busy={busy === String(p.id)}>
                  <TableCell className="font-mono text-xs">
                    #{String(p.mac_id ?? "-")}
                  </TableCell>
                  <TableCell>{p.tahmin_turu ?? "-"}</TableCell>
                  <TableCell className="text-right font-mono">
                    {p.oran != null ? p.oran.toFixed(2) : "-"}
                  </TableCell>
                  <TableCell>
                    {p.kaynak ? (
                      <Badge variant="outline">{p.kaynak}</Badge>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        p.sonuc === "DOGRU"
                          ? "secondary"
                          : p.sonuc === "YANLIS"
                            ? "destructive"
                            : "outline"
                      }
                    >
                      {p.sonuc ?? "BEKLIYOR"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {p.olusturulma_tarihi
                      ? formatDistanceToNow(new Date(p.olusturulma_tarihi), {
                          addSuffix: true,
                          locale: tr,
                        })
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => updateSonuc(p.id, "DOGRU")}
                        >
                          <Check className="h-4 w-4 mr-2" /> DOGRU
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => updateSonuc(p.id, "YANLIS")}
                        >
                          <X className="h-4 w-4 mr-2" /> YANLIS
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => remove(p.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Sil
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
