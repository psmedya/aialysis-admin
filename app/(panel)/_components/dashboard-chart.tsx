"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

type Row = { date: string; total: number; basari: number };

export function DashboardChart({ data }: { data: Row[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[280px] flex items-center justify-center text-sm text-muted-foreground">
        Yeterli veri yok
      </div>
    );
  }

  return (
    <div className="h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="date"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            yAxisId="left"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            domain={[0, 100]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--popover))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="total"
            stroke="#6366f1"
            strokeWidth={2}
            name="Tahmin sayisi"
            dot={false}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="basari"
            stroke="#10b981"
            strokeWidth={2}
            name="Basari (%)"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
