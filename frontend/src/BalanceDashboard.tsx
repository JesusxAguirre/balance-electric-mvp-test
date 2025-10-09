// Dashboard.tsx

import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, RefreshCw, TrendingUp } from "lucide-react";
import { BalanceChart } from "./components/features/BalanceChart";
import { DateRangePicker } from "./components/features/DateRangePicker";
import {
  getCurrentYearRange,
  useBalanceData,
  useCurrentYearByMonth,
  useLastFiveYearsByMonth,
  useCurrentYearCategorizedByMonth,
  useCategorizedBalanceData,
} from "./api/hooks/useBalanceData";
import { CombinedMonthlyChart } from "./components/charts/CombinedMonthlyChart";
import { StackedAreaChart } from "./components/charts/StackedAreaChart";
import { EnergyTreemap } from "./components/charts/EnergyTreemap";
import { RefreshDataPanel } from "./components/features/RefreshDataPanel";
import { useQueryClient } from '@tanstack/react-query';

// ============================================================================
// DASHBOARD COMPONENT
// ============================================================================
const Dashboard = () => {
  const queryClient = useQueryClient();
  
  // Usamos la utilidad para obtener el rango del año actual
  const { start: yearStart, end: yearEnd } = getCurrentYearRange();

  const [customRange, setCustomRange] = useState({ start: "", end: "" });

  const monthlyData = useCurrentYearByMonth(); // Current year by month
  const fiveYearData = useLastFiveYearsByMonth(); // Last 5 years by month
  const categorizedData = useCurrentYearCategorizedByMonth(); // Categorized data for treemap
  const customData = useBalanceData(customRange.start, customRange.end);
  const customCategorizedData = useCategorizedBalanceData(
    customRange.start, 
    customRange.end, 
    { time_grouping: 'month' }
  );

  const handleDateChange = (start: string, end: string) => {
    setCustomRange({ start, end });
  };

  const hasCustomRange = !!customRange.start && !!customRange.end;
  
  const handleRefreshComplete = () => {
    // Invalidate all queries to refetch fresh data
    queryClient.invalidateQueries({ queryKey: ['balance'] });
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <header className="mb-8 text-center">
        <div className="inline-flex items-center gap-3 mb-2">
          <TrendingUp className="w-8 h-8 text-primary" />
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Panel de Balance Eléctrico
          </h1>
        </div>
        <p className="mt-2 text-lg text-muted-foreground font-light">
          Visualización histórica de generación y demanda nacional
        </p>
      </header>


{/* Admin & Analysis Section */}
<div className="space-y-6">
  <h2 className="text-2xl font-bold">Administración y Análisis Detallado</h2>
  
  {/* Refresh Data Panel */}
  <RefreshDataPanel onRefreshComplete={handleRefreshComplete} />
</div>
<Separator className="my-8" />


      <div className="max-w-7xl mx-auto space-y-8">
        {/* Permanent Current Year Charts */}
        <div className="space-y-6">
          {/* Monthly Combined Chart */}
          {monthlyData.isLoading ? (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-[400px] w-full" />
                </div>
              </CardContent>
            </Card>
          ) : monthlyData.isError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                No se pudo cargar la serie mensual: {monthlyData.error?.message}
              </AlertDescription>
            </Alert>
          ) : monthlyData.data && monthlyData.data.length > 0 ? (
            <CombinedMonthlyChart data={monthlyData.data} />
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-[300px]">
                <p className="text-muted-foreground">Sin datos disponibles</p>
              </CardContent>
            </Card>
          )}

          {/* 5-Year Historical Stacked Area Chart */}
          {fiveYearData.isLoading ? (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-[350px] w-full" />
                </div>
              </CardContent>
            </Card>
          ) : fiveYearData.isError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                No se pudo cargar los datos históricos: {fiveYearData.error?.message}
              </AlertDescription>
            </Alert>
          ) : fiveYearData.data && fiveYearData.data.length > 0 ? (
            <StackedAreaChart data={fiveYearData.data} />
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-[300px]">
                <p className="text-muted-foreground">Sin datos disponibles</p>
              </CardContent>
            </Card>
          )}
        </div>

        <Separator className="my-8" />

        {/* Custom Date Range Section */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Consulta Personalizada</CardTitle>
            <CardDescription>
              Selecciona un rango de fechas específico para analizar el balance
              eléctrico
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <DateRangePicker onDateChange={handleDateChange} />

            {hasCustomRange && (
              <div className="mt-6">
                {customData.isLoading ? (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <Skeleton className="h-6 w-1/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-80 w-full" />
                      </div>
                      <div className="flex items-center justify-center mt-4 gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span className="font-medium">Obteniendo datos...</span>
                      </div>
                    </CardContent>
                  </Card>
                ) : customData.isError ? (
                  <Alert variant="destructive" className="border-2">
                    <AlertCircle className="h-5 w-5" />
                    <AlertTitle className="text-lg font-semibold">
                      Error de Conexión
                    </AlertTitle>
                    <AlertDescription className="mt-2 space-y-3">
                      <p className="text-sm">
                        <span className="font-semibold">Mensaje:</span>{" "}
                        <code className="bg-red-100 px-2 py-1 rounded text-xs">
                          {customData.error?.message}
                        </code>
                      </p>
                      {/* useQuery devuelve la función `refetch` */}
                      <Button
                        onClick={() => customData.refetch()}
                        variant="destructive"
                        size="sm"
                        className="mt-2"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Reintentar
                      </Button>
                    </AlertDescription>
                  </Alert>
                ) : customData.data && customData.data.length > 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Resultados del Rango Personalizado
                      </CardTitle>
                      <CardDescription>
                        {customRange.start} hasta {customRange.end}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <BalanceChart data={customData.data} />
                    </CardContent>
                  </Card>
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>
                      Sin Datos
                    </AlertTitle>
                    <AlertDescription>
                      No se encontraron registros para el rango seleccionado.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>
        </Card>

       
        
        <Separator className="my-8" />
        
        {/* Subtype Analysis - Uses custom range if provided, otherwise year data */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold">Análisis por Subtipos de Energía</h2>
            <p className="text-muted-foreground mt-1">
              {hasCustomRange 
                ? `Mostrando datos desde ${customRange.start} hasta ${customRange.end}` 
                : "Mostrando datos del año actual"
              }
            </p>
          </div>
          
          {/* Energy Treemap - Hierarchical Visualization */}
          {hasCustomRange ? (
            // Use custom range categorized data
            customCategorizedData.isLoading ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-[500px] w-full" />
                  </div>
                </CardContent>
              </Card>
            ) : customCategorizedData.isError ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  No se pudieron cargar los datos: {customCategorizedData.error?.message}
                </AlertDescription>
              </Alert>
            ) : customCategorizedData.data ? (
              <EnergyTreemap data={customCategorizedData.data} />
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Sin Datos</AlertTitle>
                <AlertDescription>
                  No hay datos disponibles para el rango seleccionado.
                </AlertDescription>
              </Alert>
            )
          ) : (
            // Use year data by default
            categorizedData.isLoading ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-[500px] w-full" />
                  </div>
                </CardContent>
              </Card>
            ) : categorizedData.isError ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  No se pudieron cargar los datos categorizados: {categorizedData.error?.message}
                </AlertDescription>
              </Alert>
            ) : categorizedData.data ? (
              <EnergyTreemap data={categorizedData.data} />
            ) : null
          )}
        </div>
      </div>

      <footer className="mt-16 text-center text-sm text-muted-foreground">
        <p>Desarrollado con React, TypeScript y Shadcn/ui</p>
        <p className="text-xs mt-1">
          © {new Date().getFullYear()} Panel de Balance Eléctrico
        </p>
      </footer>
    </div>
  );
};

export default Dashboard;
