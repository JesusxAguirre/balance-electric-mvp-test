import { useState } from "react";

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

  return (
    <div className="flex flex-col gap-4 p-6 bg-white border border-gray-200 rounded-lg shadow-lg w-full max-w-4xl mx-auto">
      
      {/* Mensaje de Error */}
      {error && (
        <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md transition-all duration-300">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        
        {/* Input Fecha Inicio */}
        <div className="flex-1">
          <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
            Fecha de Inicio
          </label>
          <input
            type="date"
            id="start-date"
            value={startDate}
            onChange={(e) => {setStartDate(e.target.value); setError('')}}
            className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md text-sm transition-colors focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
          />
        </div>
        
        {/* Input Fecha Fin */}
        <div className="flex-1">
          <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
            Fecha de Fin
          </label>
          <input
            type="date"
            id="end-date"
            value={endDate}
            onChange={(e) => {setEndDate(e.target.value); setError('')}}
            className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md text-sm transition-colors focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
          />
        </div>

        {/* Botón Aplicar */}
        <div className="sm:self-end">
          <button
            onClick={handleApply}
            className="w-full sm:w-auto h-10 px-6 bg-gray-900 text-white font-medium rounded-md shadow-sm transition-colors hover:bg-gray-800 active:bg-gray-700 mt-4 sm:mt-0"
          >
            Aplicar Rango
          </button>
        </div>
      </div>
    </div>
  );
};