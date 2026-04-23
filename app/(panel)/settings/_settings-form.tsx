"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Save, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

type Settings = {
  bakim_modu: boolean;
  bakim_mesaji: string;
  forum_aktif: boolean;
  blog_aktif: boolean;
  feed_aktif: boolean;
  leaderboard_aktif: boolean;
  kill_switch: boolean;
};

export function SettingsForm({ initial }: { initial: Settings }) {
  const [s, setS] = useState<Settings>(initial);
  const [saving, setSaving] = useState<string | null>(null);

  async function saveKey(key: string, value: unknown) {
    setSaving(key);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("app_config").upsert({
        key,
        value,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      toast.success(`${key} guncellendi`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Hata");
    } finally {
      setSaving(null);
    }
  }

  const toggle = (key: keyof Settings) => async (v: boolean) => {
    setS((prev) => ({ ...prev, [key]: v }));
    await saveKey(key, v);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Bakim Modu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Bakim modu aktif</Label>
            <Switch
              checked={s.bakim_modu}
              onCheckedChange={toggle("bakim_modu")}
              disabled={saving === "bakim_modu"}
            />
          </div>
          <div className="space-y-2">
            <Label>Bakim mesaji</Label>
            <div className="flex gap-2">
              <Input
                value={s.bakim_mesaji}
                onChange={(e) =>
                  setS((p) => ({ ...p, bakim_mesaji: e.target.value }))
                }
                placeholder="Sistem bakimda, lutfen sonra tekrar deneyin..."
              />
              <Button
                onClick={() => saveKey("bakim_mesaji", s.bakim_mesaji)}
                disabled={saving === "bakim_mesaji"}
              >
                {saving === "bakim_mesaji" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Feature Flags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(
            [
              ["forum_aktif", "Forum"],
              ["blog_aktif", "Blog"],
              ["feed_aktif", "Feed"],
              ["leaderboard_aktif", "Leaderboard"],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between">
              <Label>{label}</Label>
              <Switch
                checked={s[key]}
                onCheckedChange={toggle(key)}
                disabled={saving === key}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-sm text-destructive flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> Tehlikeli Bolge
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Alert variant="destructive">
            <AlertTitle>Kill switch</AlertTitle>
            <AlertDescription>
              Tum tahmin uretimini durdurur. Sadece acil durumlar icin.
            </AlertDescription>
          </Alert>
          <div className="flex items-center justify-between">
            <Label>Kill switch aktif</Label>
            <Switch
              checked={s.kill_switch}
              onCheckedChange={toggle("kill_switch")}
              disabled={saving === "kill_switch"}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
