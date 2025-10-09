import { useState } from "react";
import { RefreshCw, Download, AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const API_BASE_URL = 'http://localhost:3000/api/v1';

interface RefreshDataPanelProps {
  onRefreshComplete?: () => void;
}

interface RefreshResponse {
  message: string;
  count: number;
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

export const RefreshDataPanel: React.FC<RefreshDataPanelProps> = ({ onRefreshComplete }) => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<RefreshResponse | null>(null);

  const handleRefresh = async () => {
    setError('');
    setSuccess(null);

    if (!startDate || !endDate) {
      setError('Por favor, selecciona ambas fechas.');
      return;
    }

    if (startDate > endDate) {
      setError('La fecha de inicio no puede ser posterior a la fecha de fin.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/balance/refresh?start_date=${startDate}&end_date=${endDate}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar los datos');
      }

      const data: RefreshResponse = await response.json();
      setSuccess(data);
      
      // Call callback if provided
      if (onRefreshComplete) {
        onRefreshComplete();
      }
    } catch (err: any) {
      setError(err.message || 'Error al conectar con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const setQuickRange = (months: number) => {
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - months);
    
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Actualizar Datos desde REE API
        </CardTitle>
        <CardDescription>
          Descarga y actualiza los datos del balance eléctrico desde la API de Red Eléctrica de España
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Quick Range Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setQuickRange(1)}
            disabled={isLoading}
          >
            Último mes
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setQuickRange(3)}
            disabled={isLoading}
          >
            Últimos 3 meses
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setQuickRange(12)}
            disabled={isLoading}
          >
            Último año
          </Button>
        </div>

        {/* Date Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="refresh-start-date">Fecha de Inicio</Label>
            <Input
              type="date"
              id="refresh-start-date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="refresh-end-date">Fecha de Fin</Label>
            <Input
              type="date"
              id="refresh-end-date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Success Message */}
        {success && (
          <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800 dark:text-green-200">
              ¡Actualización Exitosa!
            </AlertTitle>
            <AlertDescription className="text-green-700 dark:text-green-300">
              {success.message}
              <br />
              <strong>{success.count}</strong> registros actualizados para el rango{' '}
              <strong>{success.dateRange.startDate}</strong> hasta{' '}
              <strong>{success.dateRange.endDate}</strong>
            </AlertDescription>
          </Alert>
        )}

        {/* Refresh Button */}
        <Button
          onClick={handleRefresh}
          disabled={isLoading || !startDate || !endDate}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Actualizando datos...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Actualizar Datos
            </>
          )}
        </Button>

        {/* Info */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>
            ℹ️ Los datos se actualizan automáticamente si ya existen (upsert).
          </p>
          <p>
            ⚠️ Rangos grandes pueden tardar varios segundos en procesarse.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
