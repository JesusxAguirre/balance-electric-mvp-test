"use client";

import * as React from "react";
import { Line, LineChart, CartesianGrid, XAxis } from "recharts";
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

interface CombinedMonthlyChartProps {
  data: BalanceRecord[];
}

// Colores consistentes para cada tipo de energía
const TYPE_COLORS: Record<EnergyType, string> = {
  [EnergyType.RENEWABLE]: "hsl(142, 76%, 36%)",
  [EnergyType.NON_RENEWABLE]: "hsl(43, 96%, 56%)",
  [EnergyType.STORAGE]: "hsl(262, 83%, 58%)",
  [EnergyType.DEMAND]: "hsl(199, 89%, 48%)",
};

export function CombinedMonthlyChart({ data }: CombinedMonthlyChartProps) {
  // Procesar datos: agrupar por fecha y tipo
  const { chartData, chartConfig, totals } = React.useMemo(() => {
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

    return { chartData: chartArray, chartConfig: config, totals: typeTotals };
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Balance Mensual por Tipo de Energía</CardTitle>
        <CardDescription>
          Comparación de tendencias del año actual
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {energyTypes.map((type) => (
            <div
              key={type}
              className="flex flex-col p-3 rounded-lg border"
              style={{
                borderLeftWidth: "4px",
                borderLeftColor: TYPE_COLORS[type],
              }}
            >
              <span className="text-xs text-muted-foreground">
                {EnergyTypeDisplayNames[type]}
              </span>
              <span className="text-xl font-bold mt-1">
                {Math.round(totals[type]).toLocaleString("es-ES")}
              </span>
              <span className="text-xs text-muted-foreground">MWh</span>
            </div>
          ))}
        </div>

        {/* Chart */}
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <LineChart
            data={chartData}
            margin={{ left: 12, right: 12, top: 12, bottom: 12 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                // Show only month name (e.g., "ene", "feb", "mar")
                return date.toLocaleDateString("es-ES", {
                  month: "short",
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
              <Line
                key={type}
                dataKey={type}
                type="monotone"
                stroke={TYPE_COLORS[type]}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
