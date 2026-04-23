"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Search } from "lucide-react";
import { format } from "date-fns";

type MatchRow = {
  id: string | number;
  ev_sahibi?: string | null;
  deplasman?: string | null;
  lig?: string | null;
  durum?: string | null;
  tarih?: string | null;
  ev_skor?: number | null;
  dep_skor?: number | null;
};

const DURUM_OPTIONS = [
  { value: "all", label: "Tum durumlar" },
  { value: "NS", label: "Baslamadi (NS)" },
  { value: "LIVE", label: "Canli" },
  { value: "FT", label: "Bitti (FT)" },
  { value: "HT", label: "Devre Arasi" },
  { value: "PST", label: "Ertelendi" },
  { value: "CANC", label: "Iptal" },
];

function durumColor(d?: string | null) {
  if (d === "LIVE") return "destructive";
  if (d === "FT") return "secondary";
  if (d === "NS") return "outline";
  return "outline" as const;
}

export function MatchesTable({ rows }: { rows: MatchRow[] }) {
  const router = useRouter();
  const sp = useSearchParams();
  const [q, setQ] = useState(sp.get("q") ?? "");
  const [durum, setDurum] = useState(sp.get("durum") ?? "all");
  const [isPending, startTransition] = useTransition();

  function applyFilters(nextQ = q, nextDurum = durum) {
    const params = new URLSearchParams();
    if (nextQ) params.set("q", nextQ);
    if (nextDurum && nextDurum !== "all") params.set("durum", nextDurum);
    startTransition(() => router.push(`/matches?${params.toString()}`));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            applyFilters();
          }}
          className="relative flex-1 max-w-md"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Takim adinda ara..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </form>
        <Select
          value={durum}
          onValueChange={(v) => {
            setDurum(v);
            applyFilters(q, v);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DURUM_OPTIONS.map((d) => (
              <SelectItem key={d.value} value={d.value}>
                {d.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={() => applyFilters()} disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Filtrele
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mac</TableHead>
              <TableHead>Lig</TableHead>
              <TableHead>Skor</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead>Tarih</TableHead>
              <TableHead className="w-[100px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Kayit yok
                </TableCell>
              </TableRow>
            ) : (
              rows.map((m) => (
                <TableRow key={String(m.id)}>
                  <TableCell className="font-medium">
                    <Link href={`/matches/${m.id}`} className="hover:underline">
                      {m.ev_sahibi ?? "-"} vs {m.deplasman ?? "-"}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {m.lig ?? "-"}
                  </TableCell>
                  <TableCell className="font-mono">
                    {m.ev_skor ?? "-"} : {m.dep_skor ?? "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={durumColor(m.durum)}>
                      {m.durum ?? "-"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {m.tarih
                      ? format(new Date(m.tarih), "dd.MM.yyyy HH:mm")
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/matches/${m.id}`}>Detay</Link>
                    </Button>
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
