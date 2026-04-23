"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, RefreshCw, Save } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

const DURUM_OPTS = ["NS", "LIVE", "HT", "FT", "PST", "CANC"];

type Initial = {
  durum: string;
  ev_skor: number | null;
  dep_skor: number | null;
};

export function MatchEditForm({
  id,
  initial,
}: {
  id: string;
  initial: Initial;
}) {
  const [form, setForm] = useState<Initial>(initial);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("maclar")
        .update({
          durum: form.durum || null,
          ev_skor: form.ev_skor,
          dep_skor: form.dep_skor,
        })
        .eq("id", id);
      if (error) throw error;
      toast.success("Mac guncellendi");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Hata");
    } finally {
      setSaving(false);
    }
  }

  async function handleRefreshSquad() {
    setRefreshing(true);
    try {
      const res = await fetch("/api/trigger-function", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          function: "kadro-guncelle",
          body: { mac_id: id },
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success("Kadro yenileme tetiklendi");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Hata");
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="space-y-2">
        <Label>Durum</Label>
        <Select
          value={form.durum}
          onValueChange={(v) => setForm((f) => ({ ...f, durum: v }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sec" />
          </SelectTrigger>
          <SelectContent>
            {DURUM_OPTS.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Ev Skor</Label>
        <Input
          type="number"
          value={form.ev_skor ?? ""}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              ev_skor: e.target.value === "" ? null : Number(e.target.value),
            }))
          }
        />
      </div>
      <div className="space-y-2">
        <Label>Deplasman Skor</Label>
        <Input
          type="number"
          value={form.dep_skor ?? ""}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              dep_skor: e.target.value === "" ? null : Number(e.target.value),
            }))
          }
        />
      </div>
      <div className="sm:col-span-3 flex flex-wrap gap-2 justify-between">
        <Button
          variant="outline"
          onClick={handleRefreshSquad}
          disabled={refreshing}
        >
          {refreshing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Kadro yenile
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Kaydet
        </Button>
      </div>
    </div>
  );
}
