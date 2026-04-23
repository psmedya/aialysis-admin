"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Play, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function FunctionsPanel({ functions }: { functions: string[] }) {
  const [selected, setSelected] = useState(functions[0] ?? "");
  const [body, setBody] = useState("{}");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<{
    status?: number;
    ok?: boolean;
    data?: unknown;
    durationMs?: number;
  } | null>(null);

  async function run() {
    setRunning(true);
    setResult(null);
    const t0 = performance.now();
    try {
      let parsed: unknown = {};
      try {
        parsed = JSON.parse(body || "{}");
      } catch {
        toast.error("Body gecersiz JSON");
        setRunning(false);
        return;
      }
      const res = await fetch("/api/trigger-function", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ function: selected, body: parsed }),
      });
      const data = await res.json().catch(() => ({}));
      const duration = Math.round(performance.now() - t0);
      setResult({
        status: res.status,
        ok: res.ok,
        data,
        durationMs: duration,
      });
      if (res.ok) toast.success(`${selected} basarili (${duration}ms)`);
      else toast.error(`${selected} HTTP ${res.status}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Hata");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-3">
        <Select value={selected} onValueChange={setSelected}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {functions.map((f) => (
              <SelectItem key={f} value={f}>
                {f}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Body (JSON)</p>
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={10}
            className="font-mono text-xs"
          />
        </div>
        <Button onClick={run} disabled={running || !selected}>
          {running ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Play className="h-4 w-4 mr-2" />
          )}
          Tetikle
        </Button>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Response</p>
          {result && (
            <div className="flex gap-2 items-center">
              {result.durationMs != null && (
                <Badge variant="outline" className="font-mono text-xs">
                  {result.durationMs}ms
                </Badge>
              )}
              <Badge
                variant={result.ok ? "secondary" : "destructive"}
                className="font-mono text-xs"
              >
                HTTP {result.status}
              </Badge>
            </div>
          )}
        </div>
        <pre className="p-3 rounded-md bg-muted/50 border text-xs font-mono overflow-auto max-h-[400px]">
          {result
            ? JSON.stringify(result.data, null, 2)
            : "// Henuz calistirilmadi"}
        </pre>
      </div>
    </div>
  );
}
