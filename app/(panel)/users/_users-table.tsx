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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MoreHorizontal, Search, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

type UserRow = {
  user_id: string;
  kullanici_adi?: string | null;
  puan?: number | null;
  rutbe?: string | null;
  kayit_tarihi?: string | null;
  updated_at?: string | null;
  tahmin_dogru?: number | null;
  tahmin_yanlis?: number | null;
};

const RUTBE_OPTIONS = [
  { value: "all", label: "Tum rutbeler" },
  { value: "Rookie", label: "Rookie" },
  { value: "Bronze", label: "Bronze" },
  { value: "Silver", label: "Silver" },
  { value: "Gold", label: "Gold" },
  { value: "Platinum", label: "Platinum" },
  { value: "Pro", label: "Pro" },
  { value: "Legend", label: "Legend" },
];

export function UsersTable({ initialRows }: { initialRows: UserRow[] }) {
  const router = useRouter();
  const sp = useSearchParams();
  const [q, setQ] = useState(sp.get("q") ?? "");
  const [rutbe, setRutbe] = useState(sp.get("rutbe") ?? "all");
  const [isPending, startTransition] = useTransition();

  function applyFilters(nextQ = q, nextRutbe = rutbe) {
    const params = new URLSearchParams();
    if (nextQ) params.set("q", nextQ);
    if (nextRutbe && nextRutbe !== "all") params.set("rutbe", nextRutbe);
    startTransition(() => {
      router.push(`/users?${params.toString()}`);
    });
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
            placeholder="Kullanici adi ara..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </form>
        <Select
          value={rutbe}
          onValueChange={(v) => {
            setRutbe(v);
            applyFilters(q, v);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RUTBE_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
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
              <TableHead>Kullanici</TableHead>
              <TableHead className="text-right">Puan</TableHead>
              <TableHead>Rutbe</TableHead>
              <TableHead className="text-right">Dogru/Yanlis</TableHead>
              <TableHead>Kayit</TableHead>
              <TableHead>Guncellendi</TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  Kayit bulunamadi
                </TableCell>
              </TableRow>
            ) : (
              initialRows.map((u) => (
                <TableRow key={u.user_id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/users/${u.user_id}`}
                      className="hover:underline"
                    >
                      {u.kullanici_adi ?? u.user_id.slice(0, 8)}
                    </Link>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {u.puan ?? 0}
                  </TableCell>
                  <TableCell>
                    {u.rutbe ? (
                      <Badge variant="secondary">{u.rutbe}</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    <span className="text-emerald-500">{u.tahmin_dogru ?? 0}</span>
                    {" / "}
                    <span className="text-rose-500">{u.tahmin_yanlis ?? 0}</span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {u.kayit_tarihi
                      ? formatDistanceToNow(new Date(u.kayit_tarihi), {
                          addSuffix: true,
                          locale: tr,
                        })
                      : "-"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {u.updated_at
                      ? formatDistanceToNow(new Date(u.updated_at), {
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
                        <DropdownMenuItem asChild>
                          <Link href={`/users/${u.user_id}`}>Profil goruntule</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/users/${u.user_id}?edit=puan`}>
                            Puan duzenle
                          </Link>
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
