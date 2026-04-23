"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

type Initial = {
  kullanici_adi: string;
  puan: number;
  rutbe: string;
};

export function UserEditForm({
  id,
  initial,
}: {
  id: string;
  initial: Initial;
}) {
  const [form, setForm] = useState<Initial>(initial);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiller")
        .update({
          kullanici_adi: form.kullanici_adi || null,
          puan: Number(form.puan) || 0,
          rutbe: form.rutbe || null,
        })
        .eq("id", id);
      if (error) throw error;
      toast.success("Kullanici guncellendi");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Hata";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="space-y-2">
        <Label>Kullanici Adi</Label>
        <Input
          value={form.kullanici_adi}
          onChange={(e) =>
            setForm((f) => ({ ...f, kullanici_adi: e.target.value }))
          }
        />
      </div>
      <div className="space-y-2">
        <Label>Puan</Label>
        <Input
          type="number"
          value={form.puan}
          onChange={(e) =>
            setForm((f) => ({ ...f, puan: Number(e.target.value) }))
          }
        />
      </div>
      <div className="space-y-2">
        <Label>Rutbe</Label>
        <Input
          value={form.rutbe}
          onChange={(e) =>
            setForm((f) => ({ ...f, rutbe: e.target.value }))
          }
          placeholder="Rookie/Bronze/..."
        />
      </div>
      <div className="sm:col-span-3 flex justify-end">
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
