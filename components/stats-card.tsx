import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type Trend = {
  value: number;
  label?: string;
  direction?: "up" | "down" | "neutral";
};

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accent,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: Trend;
  accent?: "default" | "success" | "warning" | "destructive";
}) {
  const accentColor =
    accent === "success"
      ? "text-emerald-500 bg-emerald-500/10"
      : accent === "warning"
        ? "text-amber-500 bg-amber-500/10"
        : accent === "destructive"
          ? "text-destructive bg-destructive/10"
          : "text-primary bg-primary/10";

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && (
          <div
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg",
              accentColor,
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
        {trend && (
          <p
            className={cn(
              "text-xs mt-2 font-medium",
              trend.direction === "up" && "text-emerald-500",
              trend.direction === "down" && "text-destructive",
              trend.direction === "neutral" && "text-muted-foreground",
            )}
          >
            {trend.direction === "up" ? "+" : trend.direction === "down" ? "" : ""}
            {trend.value}
            {trend.label ? ` ${trend.label}` : "%"}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
