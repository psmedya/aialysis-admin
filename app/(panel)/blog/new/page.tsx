"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[ıi̇]/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function NewBlogPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    baslik: "",
    slug: "",
    icerik: "",
    yayinlandi: false,
  });
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!form.baslik.trim()) {
      toast.error("Baslik gerekli");
      return;
    }
    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("blog_yazilari").insert({
        baslik: form.baslik,
        slug: form.slug || slugify(form.baslik),
        icerik: form.icerik,
        yayinlandi: form.yayinlandi,
      });
      if (error) throw error;
      toast.success("Yazi olusturuldu");
      router.push("/blog");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Hata");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Yeni Blog Yazisi</h1>
        <p className="text-muted-foreground">
          Markdown destekli icerik (TODO: preview)
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Icerik</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Baslik</Label>
            <Input
              value={form.baslik}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  baslik: e.target.value,
                  slug: f.slug || slugify(e.target.value),
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Slug</Label>
            <Input
              className="font-mono text-sm"
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>Icerik (Markdown)</Label>
            <Textarea
              value={form.icerik}
              onChange={(e) =>
                setForm((f) => ({ ...f, icerik: e.target.value }))
              }
              rows={14}
              className="font-mono text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={form.yayinlandi}
              onCheckedChange={(v) =>
                setForm((f) => ({ ...f, yayinlandi: v }))
              }
            />
            <Label>Yayinla</Label>
          </div>
          <div className="flex justify-end">
            <Button onClick={save} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Kaydet
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
