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
  type ChartConfig,
} from "@/components/ui/chart";
import { 
  EnergyType, 
  EnergyTypeDisplayNames, 
  type BalanceRecord 
} from "@/types/energy.enums";
import { TrendingUp } from "lucide-react";

interface StackedAreaChartProps {
  data: BalanceRecord[];
}

// Colores con gradientes para área
const TYPE_COLORS: Record<EnergyType, string> = {
  [EnergyType.RENEWABLE]: "hsl(142, 76%, 36%)",
  [EnergyType.NON_RENEWABLE]: "hsl(43, 96%, 56%)",
  [EnergyType.STORAGE]: "hsl(262, 83%, 58%)",
  [EnergyType.DEMAND]: "hsl(199, 89%, 48%)",
};

export function StackedAreaChart({ data }: StackedAreaChartProps) {
  // Procesar datos: agrupar por fecha y tipo
  const { chartData, chartConfig, totals, trend } = React.useMemo(() => {
    const dateMap: Record<string, any> = {};
    const typeTotals: Record<EnergyType, number> = {} as any;

    data.forEach((item) => {
      const date = item.datetime.split("T")[0];
      const type = item.type as EnergyType;

      if (!Object.values(EnergyType).includes(type)) return;

      // Inicializar fecha
      if (!dateMap[date]) {
        dateMap[date] = { date };
      }

      // Agregar valor al tipo
      if (!dateMap[date][type]) {
        dateMap[date][type] = 0;
      }
      dateMap[date][type] += item.value;

      // Sumar totales
      if (!typeTotals[type]) {
        typeTotals[type] = 0;
      }
      typeTotals[type] += item.value;
    });

    // Convertir a array y ordenar
    const chartArray = Object.values(dateMap).sort((a: any, b: any) =>
      a.date.localeCompare(b.date)
    );

    // Calcular tendencia (comparar primera mitad vs segunda mitad del dataset)
    let trendPercentage = 0;
    if (chartArray.length > 1) {
      const midPoint = Math.floor(chartArray.length / 2);
      const firstHalf = chartArray.slice(0, midPoint);
      const secondHalf = chartArray.slice(midPoint);

      const avgFirst = firstHalf.reduce((sum: number, item: any) => {
        const total = Object.values(EnergyType).reduce(
          (s: number, type) => s + (item[type] || 0),
          0
        );
        return sum + total;
      }, 0) / firstHalf.length;

      const avgSecond = secondHalf.reduce((sum: number, item: any) => {
        const total = Object.values(EnergyType).reduce(
          (s: number, type) => s + (item[type] || 0),
          0
        );
        return sum + total;
      }, 0) / secondHalf.length;

      trendPercentage = ((avgSecond - avgFirst) / avgFirst) * 100;
    }

    // Construir config dinámicamente
    const config: ChartConfig = {};
    Object.values(EnergyType).forEach((type) => {
      if (typeTotals[type]) {
        config[type] = {
          label: EnergyTypeDisplayNames[type],
          color: TYPE_COLORS[type],
        };
      }
    });

    return { 
      chartData: chartArray, 
      chartConfig: config, 
      totals: typeTotals,
      trend: trendPercentage
    };
  }, [data]);

  if (chartData.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground">No hay datos disponibles</p>
        </CardContent>
      </Card>
    );
  }

  const energyTypes = Object.keys(chartConfig) as EnergyType[];
  const totalEnergy = Object.values(totals).reduce((sum, val) => sum + val, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Composición Energética Acumulada</CardTitle>
            <CardDescription>
              Vista consolidada del año actual
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className={`h-4 w-4 ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`} />
            <span className={trend >= 0 ? 'text-green-500' : 'text-red-500'}>
              {trend >= 0 ? '+' : ''}{trend.toFixed(1)}%
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Total Summary */}
        <div className="mb-6 p-4 rounded-lg border bg-muted/50">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">
              {Math.round(totalEnergy).toLocaleString("es-ES")}
            </span>
            <span className="text-muted-foreground">MWh Total</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-4">
            {energyTypes.map((type) => {
              const percentage = (totals[type] / totalEnergy) * 100;
              return (
                <div key={type} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: TYPE_COLORS[type] }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {EnergyTypeDisplayNames[type]}: {percentage.toFixed(1)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stacked Area Chart */}
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <AreaChart
            data={chartData}
            margin={{ left: 12, right: 12, top: 12, bottom: 12 }}
          >
            <defs>
              {energyTypes.map((type) => (
                <linearGradient
                  key={type}
                  id={`fill${type}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={TYPE_COLORS[type]}
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor={TYPE_COLORS[type]}
                    stopOpacity={0.1}
                  />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("es-ES", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  }
                />
              }
            />
            <ChartLegend content={<ChartLegendContent />} />

            {energyTypes.map((type) => (
              <Area
                key={type}
                dataKey={type}
                type="monotone"
                fill={`url(#fill${type})`}
                stroke={TYPE_COLORS[type]}
                strokeWidth={2}
                stackId="energy"
              />
            ))}
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
