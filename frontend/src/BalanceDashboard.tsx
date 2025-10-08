import React, { useState, useMemo } from 'react';
// Importamos solo lo necesario del QueryClient y el hook de useQuery
import { QueryClient, QueryClientProvider,   } from '@tanstack/react-query';
import { useBalanceData } from './api/hooks/useBalanceData';
import { DateRangePicker } from './components/features/DateRangePicker';
import { BalanceChart } from './components/features/BalanceChart';


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Configuración robusta para el manejo de la API (Fase 3.2)
      refetchOnWindowFocus: false,
      retry: 3, // Intentar hasta 3 veces en caso de fallo
    },
  },
});



// =========================================================================================
// COMPONENTE PRINCIPAL (Orquestador: Fase 2.3)
// =========================================================================================
const Dashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState<{ startDate: string, endDate: string }>({ 
    startDate: '', 
    endDate: '' 
  });
  
  // Tipado del resultado de la consulta
  const { data, isLoading, isError, error, refetch, isFetching } = useBalanceData(
    dateRange.startDate, 
    dateRange.endDate
  );

  const handleDateChange = (start: string, end: string) => {
    setDateRange({ startDate: start, endDate: end });
  };
  
  // Lógica de Renderizado Condicional
  const content = useMemo(() => {
    const isReady = !!dateRange.startDate && !!dateRange.endDate;

    if (!isReady) {
      return (
        <div className="text-center p-12 bg-white rounded-lg shadow-md border border-gray-200">
          <p className="text-xl text-gray-600">
            👋 Selecciona un rango de fechas para visualizar el Balance Eléctrico.
          </p>
        </div>
      );
    }
    
    // 3.1 Manejo de Estado Loading/Fetching
    if (isLoading || isFetching) {
      return (
        <div className="p-8 bg-white rounded-lg shadow-md border border-gray-200">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-100 rounded w-1/2 mb-4"></div>
            <div className="h-72 bg-gray-100 rounded-md"></div>
          </div>
          <p className="mt-6 text-center text-sky-600 font-medium">Obteniendo datos del backend...</p>
        </div>
      );
    }

    // 3.2 Manejo de Estado Error
    if (isError) {
      return (
        <div className="p-6 bg-red-50 border border-red-200 text-red-800 rounded-lg shadow-md">
          <h4 className="font-bold text-lg mb-2 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.023 3.377 1.868 3.377h14.464c1.845 0 2.734-1.877 1.868-3.377l-7.232-12.551c-.866-1.5-3.044-1.5-3.91 0L3.697 16.376z" />
            </svg>
            Error de Conexión o Datos
          </h4>
          <p className="mb-4 text-sm">
            Mensaje: <span className="font-mono bg-red-100 p-1 rounded">{error.message || 'Error desconocido.'}</span>
            <br />
            Por favor, verifica que el servicio de NestJS esté activo y la conexión a la base de datos sea correcta.
          </p>
          <button
            onClick={() => refetch()}
            className="h-9 px-4 bg-red-600 text-white font-medium rounded-md shadow-sm transition-colors hover:bg-red-700 text-sm"
          >
            Reintentar Consulta
          </button>
        </div>
      );
    }

    // 3.3 Manejo de Estado Success (Visualización)
    if (data && data.length > 0) {
      // Pasamos los datos tipificados al componente Chart
      return <BalanceChart data={data} />;
    }
    
    // Caso de éxito sin datos
    return (
        <div className="text-center p-12 bg-white rounded-lg shadow-md border border-gray-200">
            <p className="text-xl text-gray-600">
                🔎 No se encontraron registros de balance eléctrico para el rango seleccionado.
            </p>
        </div>
    );
  }, [isLoading, isFetching, isError, error, data, dateRange]);


  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-sans">
      
      {/* Header (Estilo Clean) */}
      <header className="mb-10 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
          Panel de Balance Eléctrico
        </h1>
        <p className="mt-2 text-md text-gray-500 font-light">
          Visualización histórica de generación y demanda nacional.
        </p>
      </header>

      {/* Selector de Fechas (Componente interno) */}
      <DateRangePicker onDateChange={handleDateChange} />

      {/* Contenedor Principal del Contenido (Gráfico/Estados) */}
      <main className="max-w-6xl mx-auto p-4">
        {content}
      </main>
      
      {/* Footer */}
      <footer className="mt-12 text-center text-xs text-gray-400">
        <p>Desarrollado con React, TypeScript y Shadcn/ui (simulado con Tailwind CSS).</p>
      </footer>
    </div>
  );
};



const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <Dashboard />
  </QueryClientProvider>
);

export default App;
