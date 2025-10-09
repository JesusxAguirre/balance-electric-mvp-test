import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

interface DateRangePickerProps {
    onDateChange: (startDate: string, endDate: string) => void;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({ onDateChange }) => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleApply = () => {
    setError('');
    if (!startDate || !endDate) {
      setError('Debes seleccionar ambas fechas.');
      return;
    }
    if (startDate > endDate) {
      setError('La fecha de inicio no puede ser posterior a la fecha de fin.');
      return;
    }
    
    onDateChange(startDate, endDate);
  };

  const handleClear = () => {
    setStartDate('');
    setEndDate('');
    setError('');
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-4">
          
          {/* Mensaje de Error */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Input Fecha Inicio */}
            <div className="space-y-2">
              <Label htmlFor="start-date" className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Fecha de Inicio
              </Label>
              <Input
                type="date"
                id="start-date"
                value={startDate}
                onChange={(e) => {setStartDate(e.target.value); setError('')}}
              />
            </div>
            
            {/* Input Fecha Fin */}
            <div className="space-y-2">
              <Label htmlFor="end-date" className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Fecha de Fin
              </Label>
              <Input
                type="date"
                id="end-date"
                value={endDate}
                onChange={(e) => {setEndDate(e.target.value); setError('')}}
              />
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex flex-col sm:flex-row gap-2 justify-end">
            <Button
              variant="outline"
              onClick={handleClear}
              disabled={!startDate && !endDate}
            >
              Limpiar
            </Button>
            <Button
              onClick={handleApply}
              disabled={!startDate || !endDate}
            >
              Aplicar Rango
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};