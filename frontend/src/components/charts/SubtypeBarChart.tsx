"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  EnergyType, 
  EnergyTypeDisplayNames,
  EnergySubtype,
  EnergySubtypeDisplayNames,
  type BalanceRecord 
} from "@/types/energy.enums";

interface SubtypeBarChartProps {
  data: BalanceRecord[];
}

export function SubtypeBarChart({ data }: SubtypeBarChartProps) {
  const [selectedType, setSelectedType] = React.useState<EnergyType | "ALL">("ALL");

  // Process data: group by subtype
  const chartData = React.useMemo(() => {
    const subtypeMap: Record<string, { subtype: string; total: number; type: EnergyType }> = {};

    data.forEach((item) => {
      // Filter by selected type if not "ALL"
      if (selectedType !== "ALL" && item.type !== selectedType) {
        return;
      }

      const key = item.subtype;
      if (!subtypeMap[key]) {
        subtypeMap[key] = {
          subtype: EnergySubtypeDisplayNames[item.subtype as EnergySubtype] || item.subtype,
          total: 0,
          type: item.type,
        };
      }
      subtypeMap[key].total += item.value;
    });

    // Convert to array and sort by total descending
    return Object.values(subtypeMap).sort((a, b) => b.total - a.total);
  }, [data, selectedType]);

  // Get available types from data
  const availableTypes = React.useMemo(() => {
    const types = new Set<EnergyType>();
    data.forEach(item => types.add(item.type));
    return Array.from(types).sort();
  }, [data]);

  // Build chart config
  const chartConfig: ChartConfig = {
    total: {
      label: "Total",
      color: "hsl(var(--chart-1))",
    },
  };

  if (chartData.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground">No hay datos de subtipo disponibles</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Desglose por Subtipo de Energía</CardTitle>
            <CardDescription>
              Distribución detallada de fuentes energéticas
            </CardDescription>
          </div>
          <Select
            value={selectedType}
            onValueChange={(value) => setSelectedType(value as EnergyType | "ALL")}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos los tipos</SelectItem>
              {availableTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {EnergyTypeDisplayNames[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="subtype"
              angle={-45}
              textAnchor="end"
              height={100}
              interval={0}
              tick={{ fontSize: 11 }}
            />
            <YAxis
              tickFormatter={(value) => {
                if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                return value.toString();
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => {
                    return `${Math.round(Number(value)).toLocaleString("es-ES")} MWh`;
                  }}
                />
              }
            />
            <Bar
              dataKey="total"
              radius={[8, 8, 0, 0]}
              fill="hsl(var(--chart-1))"
            />
          </BarChart>
        </ChartContainer>
        
        {/* Summary Stats */}
        <div className="mt-4 p-4 rounded-lg border bg-muted/50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Total Subtypes</p>
              <p className="text-2xl font-bold">{chartData.length}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Mayor Contribución</p>
              <p className="text-sm font-semibold truncate">{chartData[0]?.subtype}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Valor Máximo</p>
              <p className="text-lg font-bold">
                {Math.round(chartData[0]?.total || 0).toLocaleString("es-ES")} MWh
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Energía</p>
              <p className="text-lg font-bold">
                {Math.round(
                  chartData.reduce((sum, item) => sum + item.total, 0)
                ).toLocaleString("es-ES")} MWh
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
