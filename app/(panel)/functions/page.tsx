import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FunctionsPanel } from "./_functions-panel";

export const dynamic = "force-dynamic";

// Projedeki 26-28 edge function (reference_edge_functions'dan)
const FUNCTIONS = [
  "mac-yenile",
  "mac-oncu-v2",
  "canli-mac-tarayici",
  "tahmin-sonuc-guncelle",
  "kadro-guncelle",
  "ogrenme-motoru",
  "odds-live",
  "puan-guncelle",
  "rutbe-hesapla",
  "istatistik-toplama",
  "blog-yayinla",
  "cache-temizle",
  "config",
  "analiz-et",
  "gemini-analiz",
  "groq-analiz",
  "poisson-hesapla",
  "mac-onu-compile",
  "lig-senkron",
  "takim-senkron",
  "oyuncu-senkron",
  "forum-mod",
  "bildirim-gonder",
  "puan-rutbe-eski",
  "api-sport-fixture",
  "api-sport-odds",
];

export default function FunctionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edge Functions</h1>
        <p className="text-muted-foreground">
          Supabase Edge Function manuel tetikle ve response gor
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">
            {FUNCTIONS.length} function listelendi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FunctionsPanel functions={FUNCTIONS} />
        </CardContent>
      </Card>
    </div>
  );
}
