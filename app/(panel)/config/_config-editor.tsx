"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Search, Save, Loader2, Check, X } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

type ConfigRow = {
  key: string;
  value: unknown;
  description?: string | null;
  updated_at?: string | null;
};

function formatValue(v: unknown) {
  if (v === null || v === undefined) return "";
  if (typeof v === "string") return v;
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
}

function parseValue(raw: string): unknown {
  const trimmed = raw.trim();
  if (trimmed === "") return null;
  // number?
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);
  // boolean?
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  // JSON?
  if (
    (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
    (trimmed.startsWith("[") && trimmed.endsWith("]"))
  ) {
    return JSON.parse(trimmed);
  }
  // fallback string
  return raw;
}

export function ConfigEditor({ rows }: { rows: ConfigRow[] }) {
  const [search, setSearch] = useState("");
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.key.toLowerCase().includes(q) ||
        (r.description ?? "").toLowerCase().includes(q) ||
        formatValue(r.value).toLowerCase().includes(q),
    );
  }, [rows, search]);

  async function handleSave(row: ConfigRow) {
    const raw = edits[row.key] ?? formatValue(row.value);
    setSaving(row.key);
    try {
      const parsed = parseValue(raw);
      const supabase = createClient();
      const { error } = await supabase
        .from("app_config")
        .update({
          value: parsed,
          updated_at: new Date().toISOString(),
        })
        .eq("key", row.key);
      if (error) throw error;
      toast.success(`${row.key} guncellendi`);
      row.value = parsed;
      setEdits((e) => {
        const copy = { ...e };
        delete copy[row.key];
        return copy;
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Hata";
      toast.error(`${row.key}: ${msg}`);
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Anahtar veya aciklamada ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="text-xs text-muted-foreground">
        {filtered.length} / {rows.length} kayit. JSON, sayi, boolean, string
        otomatik algilanir.
      </div>

      <div className="space-y-3">
        {filtered.map((row) => {
          const current = edits[row.key] ?? formatValue(row.value);
          const isDirty = row.key in edits;
          const isSaving = saving === row.key;
          return (
            <Card key={row.key}>
              <CardContent className="pt-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="lg:w-72 space-y-1.5 flex-shrink-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <code className="text-sm font-mono font-semibold">
                        {row.key}
                      </code>
                      {isDirty && (
                        <Badge variant="outline" className="text-amber-500">
                          degisti
                        </Badge>
                      )}
                    </div>
                    {row.description && (
                      <p className="text-xs text-muted-foreground">
                        {row.description}
                      </p>
                    )}
                    {row.updated_at && (
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(row.updated_at).toLocaleString("tr-TR")}
                      </p>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <Textarea
                      value={current}
                      onChange={(e) =>
                        setEdits((prev) => ({
                          ...prev,
                          [row.key]: e.target.value,
                        }))
                      }
                      className="font-mono text-xs min-h-[80px]"
                      rows={Math.min(
                        8,
                        Math.max(2, current.split("\n").length),
                      )}
                    />
                    <div className="flex items-center gap-2 justify-end">
                      {isDirty && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setEdits((e) => {
                              const c = { ...e };
                              delete c[row.key];
                              return c;
                            })
                          }
                        >
                          <X className="h-4 w-4 mr-1" /> Iptal
                        </Button>
                      )}
                      <Button
                        size="sm"
                        onClick={() => handleSave(row)}
                        disabled={!isDirty || isSaving}
                      >
                        {isSaving ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4 mr-1" />
                        )}
                        Kaydet
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            Arama sonucu bulunamadi.
          </div>
        )}
      </div>
    </div>
  );
}
