"use client";

import { useMemo } from "react";
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
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { 
    EnergyType, 
    EnergyTypeDisplayNames, 
    type BalanceRecord 
} from "../../types/energy.enums";

interface BalanceChartProps {
    data: BalanceRecord[];
}

// Mapeo simple de colores para los tipos de energía con hsl values
const TYPE_COLORS: Record<EnergyType, string> = {
    [EnergyType.RENEWABLE]: 'hsl(142, 76%, 36%)', // Verde
    [EnergyType.NON_RENEWABLE]: 'hsl(43, 96%, 56%)', // Amarillo
    [EnergyType.STORAGE]: 'hsl(262, 83%, 58%)', // Indigo
    [EnergyType.DEMAND]: 'hsl(199, 89%, 48%)', // Sky blue
};

export const BalanceChart: React.FC<BalanceChartProps> = ({ data }) => {
  
  // Agrupar datos por tipo de energía
  const energyTypeData = useMemo(() => {
    const grouped: Record<EnergyType, { date: string; value: number }[]> = {} as any;
    const totals: Record<EnergyType, number> = {} as any;

    data.forEach(item => {
      const date = item.datetime.split('T')[0];
      const type = item.type as EnergyType;

      if (!Object.values(EnergyType).includes(type)) {
        return;
      }

      if (!grouped[type]) {
        grouped[type] = [];
        totals[type] = 0;
      }

      // Buscar si ya existe un registro para esta fecha
      const existingDateIndex = grouped[type].findIndex(d => d.date === date);
      
      if (existingDateIndex >= 0) {
        grouped[type][existingDateIndex].value += item.value;
      } else {
        grouped[type].push({ date, value: item.value });
      }

      totals[type] += item.value;
    });

    // Ordenar por fecha
    Object.keys(grouped).forEach(key => {
      grouped[key as EnergyType].sort((a, b) => a.date.localeCompare(b.date));
    });

    return { grouped, totals };
  }, [data]);

  if (Object.keys(energyTypeData.grouped).length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground">No hay datos de energía para mostrar en este rango.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {Object.entries(energyTypeData.grouped).map(([type, chartData]) => {
        const energyType = type as EnergyType;
        const total = energyTypeData.totals[energyType];
        const label = EnergyTypeDisplayNames[energyType];
        const color = TYPE_COLORS[energyType];

        const chartConfig: ChartConfig = {
          value: {
            label: label,
            color: color,
          },
        };

        return (
          <Card key={type}>
            <CardHeader>
              <CardTitle>{label}</CardTitle>
              <CardDescription>
                Total: {Math.round(total).toLocaleString("es-ES")} MWh
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <LineChart
                  data={chartData}
                  margin={{
                    left: 12,
                    right: 12,
                    top: 12,
                    bottom: 12,
                  }}
                >
                  <CartesianGrid vertical={false} />
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
                        className="w-[150px]"
                        labelFormatter={(value) => {
                          return new Date(value).toLocaleDateString("es-ES", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          });
                        }}
                      />
                    }
                  />
                  <Line
                    dataKey="value"
                    type="monotone"
                    stroke={color}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};