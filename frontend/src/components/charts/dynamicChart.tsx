"use client";

import * as React from "react";
import { LineChart, Line, XAxis, CartesianGrid } from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { EnergyType, getEnergyTypeDisplayName, type BalanceRecord } from "@/types/energy.enums";
import { groupBalanceByDate } from "@/utils/energyTransform";

interface DynamicBalanceChartProps {
  data: Pick<BalanceRecord, "datetime" | "value">[];
  type: EnergyType;
}

export function DynamicBalanceChart({ data, type }: DynamicBalanceChartProps) {
  if (!data || data.length === 0) {
    return <Card className="p-4 text-center text-gray-500">No hay datos disponibles</Card>;
  }

  const grouped = React.useMemo(() => groupBalanceByDate(data), [data]);
  const label = getEnergyTypeDisplayName(type);
  const color = {
    [EnergyType.RENEWABLE]: "var(--chart-1)",
    [EnergyType.NON_RENEWABLE]: "var(--chart-2)",
    [EnergyType.STORAGE]: "var(--chart-3)",
    [EnergyType.DEMAND]: "var(--chart-4)",
  }[type];

  const total = grouped.reduce((acc, curr) => acc + curr.total, 0);

  return (
    <Card className="py-4 sm:py-0">
      <CardHeader>
        <CardTitle>{label}</CardTitle>
        <CardDescription>Total: {total.toLocaleString("es-ES")} MWh</CardDescription>
      </CardHeader>

      <CardContent className="px-2 sm:p-6">
        <ChartContainer config={{ [type]: { label, color } }} className="aspect-auto h-[250px] w-full">
          <LineChart data={grouped} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => new Date(value).toLocaleDateString("es-ES", { month: "short", day: "numeric" })}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  labelFormatter={(value) => new Date(value).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
                />
              }
            />
            <Line dataKey="total" type="monotone" stroke={color} strokeWidth={2} dot={false} />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
