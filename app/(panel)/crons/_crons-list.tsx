"use client";

import { useState } from "react";
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
import { Loader2, Play } from "lucide-react";
import { toast } from "sonner";

type Cron = {
  jobname: string;
  schedule: string;
  fn: string;
  health: Record<string, unknown> | null;
};

export function CronsList({ crons }: { crons: Cron[] }) {
  const [running, setRunning] = useState<string | null>(null);

  async function trigger(fn: string) {
    setRunning(fn);
    try {
      const res = await fetch("/api/trigger-function", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ function: fn, body: {} }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      toast.success(`${fn} tetiklendi`, {
        description: data.status ? `HTTP ${data.status}` : undefined,
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Hata");
    } finally {
      setRunning(null);
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Gorev</TableHead>
          <TableHead className="font-mono">Schedule</TableHead>
          <TableHead>Durum</TableHead>
          <TableHead>Son Calisma</TableHead>
          <TableHead className="text-right">Islem</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {crons.map((c) => {
          const h = c.health;
          const status =
            (h?.status as string | undefined) ??
            (h?.last_status as string | undefined) ??
            null;
          const healthy =
            status &&
            ["succeeded", "success", "ok", "healthy"].includes(
              status.toLowerCase(),
            );
          const lastRun =
            (h?.last_run_at as string | undefined) ??
            (h?.end_time as string | undefined) ??
            null;
          return (
            <TableRow key={c.jobname}>
              <TableCell className="font-medium">{c.jobname}</TableCell>
              <TableCell className="font-mono text-xs">{c.schedule}</TableCell>
              <TableCell>
                {status ? (
                  <Badge variant={healthy ? "secondary" : "destructive"}>
                    {status}
                  </Badge>
                ) : (
                  <Badge variant="outline">bilinmiyor</Badge>
                )}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {lastRun ? new Date(lastRun).toLocaleString("tr-TR") : "-"}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={running === c.fn}
                  onClick={() => trigger(c.fn)}
                >
                  {running === c.fn ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4 mr-1" />
                  )}
                  Tetikle
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
