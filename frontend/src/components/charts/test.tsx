"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBalanceData } from "@/api/hooks/useBalanceData";

export function BalanceAreaChart() {
  const [timeRange, setTimeRange] = React.useState<"7d" | "30d" | "365d">("30d");

  // Calcular rango de fechas
  const today = new Date();
  const start = new Date(today);
  const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 365;
  start.setDate(today.getDate() - days);

  const startDate = start.toISOString().split("T")[0];
  const endDate = today.toISOString().split("T")[0];

  const { data, isLoading, isError, error } = useBalanceData(startDate, endDate);

  const chartConfig = {
    renewable: { label: "Renovable", color: "var(--chart-1)" },
    nonRenewable: { label: "No Renovable", color: "var(--chart-2)" },
  };

  return (
    <Card>
      <CardHeader className="flex items-center justify-between border-b">
        <div>
          <CardTitle>Balance Eléctrico Nacional</CardTitle>
          <CardDescription>Generación renovable vs no renovable</CardDescription>
        </div>
        <Select value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Periodo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Últimos 7 días</SelectItem>
            <SelectItem value="30d">Últimos 30 días</SelectItem>
            <SelectItem value="365d">Último año</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent>
        {isLoading && <p className="text-sm text-gray-500">Cargando datos...</p>}
        {isError && <p className="text-red-600">Error: {error?.message}</p>}
        {!isLoading && data && data.length > 0 && (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="fillRenew" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-renewable)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-renewable)" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="fillNonRenew" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-nonRenewable)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-nonRenewable)" stopOpacity={0.1} />
                </linearGradient>
              </defs>

              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(v) => new Date(v).toLocaleDateString("es-ES", { month: "short", day: "numeric" })}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    indicator="dot"
                    labelFormatter={(v) => new Date(v).toLocaleDateString("es-ES", {
                      month: "short",
                      day: "numeric",
                    })}
                  />
                }
              />
              <Area
                dataKey="renewable"
                type="natural"
                fill="url(#fillRenew)"
                stroke="var(--color-renewable)"
                stackId="a"
              />
              <Area
                dataKey="nonRenewable"
                type="natural"
                fill="url(#fillNonRenew)"
                stroke="var(--color-nonRenewable)"
                stackId="a"
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
