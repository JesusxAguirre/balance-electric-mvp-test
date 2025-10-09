"use client";

import * as React from "react";
import { Treemap, ResponsiveContainer, Tooltip } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  EnergyType, 
  EnergyTypeDisplayNames,
  EnergySubtypeDisplayNames,
  type EnergySubtype
} from "@/types/energy.enums";

interface CategorizedData {
  RENEWABLE: Array<{ subtype: string; totalValue: number }>;
  NON_RENEWABLE: Array<{ subtype: string; totalValue: number }>;
  STORAGE: Array<{ subtype: string; totalValue: number }>;
  DEMAND: Array<{ subtype: string; totalValue: number }>;
}

interface EnergyTreemapProps {
  data: CategorizedData;
}

// Color mapping by type
const TYPE_COLORS: Record<EnergyType, string> = {
  [EnergyType.RENEWABLE]: "#10b981", // Green
  [EnergyType.NON_RENEWABLE]: "#f59e0b", // Amber
  [EnergyType.STORAGE]: "#8b5cf6", // Purple
  [EnergyType.DEMAND]: "#3b82f6", // Blue
};

// Lighter shades for subtypes
const getSubtypeColor = (type: EnergyType, index: number) => {
  const baseColors: Record<EnergyType, string[]> = {
    [EnergyType.RENEWABLE]: [
      "#10b981", "#059669", "#047857", "#065f46", "#064e3b",
      "#6ee7b7", "#34d399", "#10b981"
    ],
    [EnergyType.NON_RENEWABLE]: [
      "#f59e0b", "#d97706", "#b45309", "#92400e", "#78350f",
      "#fbbf24", "#f59e0b", "#d97706"
    ],
    [EnergyType.STORAGE]: [
      "#8b5cf6", "#7c3aed", "#6d28d9", "#5b21b6", "#4c1d95",
      "#a78bfa", "#8b5cf6", "#7c3aed"
    ],
    [EnergyType.DEMAND]: [
      "#3b82f6", "#2563eb", "#1d4ed8", "#1e40af", "#1e3a8a",
      "#60a5fa", "#3b82f6", "#2563eb"
    ],
  };
  
  return baseColors[type][index % baseColors[type].length];
};

export function EnergyTreemap({ data }: EnergyTreemapProps) {
  // Transform categorized data to treemap format
  const treemapData = React.useMemo(() => {
    const result: any[] = [];
    
    Object.entries(data).forEach(([typeKey, subtypes]) => {
      const type = typeKey as EnergyType;
      
      if (!subtypes || subtypes.length === 0) return;
      
      // Aggregate by subtype (in case of time_grouping with multiple months)
      const subtypeMap: Record<string, number> = {};
      
      subtypes.forEach((item: any) => {
        const subtypeKey = item.subtype;
        const value = Number(item.totalValue) || 0;
        
        if (!subtypeMap[subtypeKey]) {
          subtypeMap[subtypeKey] = 0;
        }
        subtypeMap[subtypeKey] += value;
      });
      
      // Convert to array and add display names
      const children = Object.entries(subtypeMap).map(([subtypeKey, totalValue], index) => ({
        name: EnergySubtypeDisplayNames[subtypeKey as EnergySubtype] || subtypeKey,
        size: totalValue,
        fill: getSubtypeColor(type, index),
        type: EnergyTypeDisplayNames[type],
      }));
      
      const totalValue = children.reduce((sum: number, child: any) => sum + child.size, 0);
      
      result.push({
        name: EnergyTypeDisplayNames[type],
        children,
        fill: TYPE_COLORS[type],
        size: totalValue,
      });
    });
    
    return result;
  }, [data]);

  const totalEnergy = React.useMemo(() => {
    return treemapData.reduce((sum, item) => sum + item.size, 0);
  }, [treemapData]);

  // Custom content renderer for treemap cells
  const CustomizedContent = (props: any) => {
    const { x, y, width, height, name, size, fill } = props;
    
    // Don't render very small cells
    if (width < 40 || height < 40) return null;
    
    const percentage = ((size / totalEnergy) * 100).toFixed(1);
    
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill,
            stroke: '#fff',
            strokeWidth: 2,
            strokeOpacity: 1,
          }}
        />
        <text
          x={x + width / 2}
          y={y + height / 2 - 7}
          textAnchor="middle"
          fill="#fff"
          fontSize={width > 100 ? 14 : 11}
          fontWeight="bold"
        >
          {name}
        </text>
        <text
          x={x + width / 2}
          y={y + height / 2 + 10}
          textAnchor="middle"
          fill="#fff"
          fontSize={width > 100 ? 12 : 10}
        >
          {percentage}%
        </text>
      </g>
    );
  };

  if (treemapData.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[400px]">
          <p className="text-muted-foreground">No hay datos disponibles</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Composición Energética por Jerarquía</CardTitle>
        <CardDescription>
          Visualización de tipos y subtipos con proporciones
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {treemapData.map((item) => {
            const percentage = ((item.size / totalEnergy) * 100).toFixed(1);
            return (
              <div
                key={item.name}
                className="p-4 rounded-lg border"
                style={{
                  borderLeftWidth: "4px",
                  borderLeftColor: item.fill,
                }}
              >
                <p className="text-xs text-muted-foreground">{item.name}</p>
                <p className="text-2xl font-bold">{percentage}%</p>
                <p className="text-xs text-muted-foreground">
                  {Math.round(item.size).toLocaleString("es-ES")} MWh
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {item.children.length} subtypes
                </p>
              </div>
            );
          })}
        </div>

        {/* Treemap */}
        <ResponsiveContainer width="100%" height={500}>
          <Treemap
            data={treemapData}
            dataKey="size"
            aspectRatio={4 / 3}
            stroke="#fff"
            fill="#8884d8"
            content={<CustomizedContent />}
          >
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                
                const data = payload[0].payload;
                const percentage = ((data.size / totalEnergy) * 100).toFixed(1);
                
                return (
                  <div className="bg-background border rounded-lg p-3 shadow-lg">
                    <p className="font-semibold">{data.name}</p>
                    {data.type && (
                      <p className="text-xs text-muted-foreground">
                        Tipo: {data.type}
                      </p>
                    )}
                    <p className="text-sm mt-1">
                      {Math.round(data.size).toLocaleString("es-ES")} MWh
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {percentage}% del total
                    </p>
                  </div>
                );
              }}
            />
          </Treemap>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-4 justify-center">
          <p className="text-sm text-muted-foreground w-full text-center mb-2">
            💡 El tamaño representa la proporción de energía generada
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
