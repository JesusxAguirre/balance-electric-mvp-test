import { useMemo } from "react";
import type { BalanceRecord } from "../../types/balance";

/** Define la estructura de los datos agrupados para el gráfico. */
interface ChartDataPoint {
    date: string;
    Generacion: number;
    Demanda: number;
    [key: string]: string | number; // Permite el acceso dinámico como chartData[date][item.type]
}

interface BalanceChartProps {
    data: BalanceRecord[]; // Espera datos crudos tipificados
}

export const BalanceChart: React.FC<BalanceChartProps> = ({ data }) => {
  // Mapeo y agrupamiento de datos (Fase 2.4)
  const chartData: ChartDataPoint[] = useMemo(() => {
    const dateMap: { [key: string]: ChartDataPoint } = {};

    data.forEach(item => {
      const date = item.datetime.split('T')[0];
      if (!dateMap[date]) {
        dateMap[date] = { date: date, Generacion: 0, Demanda: 0 };
      }
      
      // La verificación de tipo asegura que solo sumemos los campos esperados
      if (item.type === 'Generacion' || item.type === 'Demanda') {
        const typeKey = item.type as keyof ChartDataPoint;
        // TypeScript requiere que nos aseguremos de que typeKey sea válido,
        // pero como ya lo comprobamos arriba, podemos usar as number para la asignación
        (dateMap[date][typeKey] as number) += item.value;
      }
    });
    return Object.values(dateMap);
  }, [data]);
  
  if (chartData.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500 bg-white rounded-lg border border-gray-200">
        No hay datos de Generación o Demanda para mostrar en este rango.
      </div>
    );
  }
  
  // Cálculo de máximos para escalar la altura de las barras
  const maxGen = Math.max(...chartData.map(d => d.Generacion));
  const maxDem = Math.max(...chartData.map(d => d.Demanda));
  const overallMax = Math.max(maxGen, maxDem) * 1.1; // 10% de margen
  
  return (
    <div className="w-full h-[500px] p-6 bg-white rounded-lg shadow-xl border border-gray-200 overflow-x-auto">
      <h3 className="text-xl font-semibold mb-4 text-gray-900">Balance Eléctrico Diario (MWh)</h3>
      <div className="h-[calc(100%-40px)] flex">
          {/* Eje Y simplificado */}
          <div className="flex flex-col justify-between text-xs text-gray-500 pr-2 pb-6 pt-4">
              <span>{Math.round(overallMax / 1000) * 1000}</span>
              <span>{Math.round(overallMax / 2 / 1000) * 1000}</span>
              <span>0</span>
          </div>

          <div className="flex items-end h-full w-full min-w-[700px] pb-6 border-l border-b border-gray-300 relative">
            
            {chartData.map((d, index) => (
              <div key={index} className="flex flex-col items-center flex-shrink-0 w-8 mx-1 justify-end h-full">
                
                {/* Contenedor de las barras */}
                <div className="flex items-end w-full h-full relative">
                    {/* Tooltip simulado */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs p-1 rounded opacity-0 transition-opacity z-10 pointer-events-none group-hover:opacity-100">
                        {d.date.substring(5)}<br/>
                        G: {Math.round(d.Generacion / 1000)}k<br/>
                        D: {Math.round(d.Demanda / 1000)}k
                    </div>

                    {/* Barra de Generación */}
                    <div 
                      title={`Generación: ${Math.round(d.Generacion)} MWh`}
                      className="w-3/5 bg-green-500 transition-all duration-500 rounded-t-sm mr-[1px] group relative hover:opacity-80"
                      style={{ height: `${(d.Generacion / overallMax) * 100}%` }}
                    ></div>
                    
                    {/* Barra de Demanda */}
                    <div 
                      title={`Demanda: ${Math.round(d.Demanda)} MWh`}
                      className="w-3/5 bg-sky-500 transition-all duration-500 rounded-t-sm group relative hover:opacity-80"
                      style={{ height: `${(d.Demanda / overallMax) * 100}%` }}
                    ></div>
                </div>

                {/* Etiqueta de fecha */}
                <div className="absolute bottom-0 text-[10px] text-gray-500 mt-2">
                  {d.date.substring(5)}
                </div>
              </div>
            ))}
          </div>
      </div>
        
      {/* Leyenda */}
      <div className="flex justify-center space-x-6 mt-4 text-sm">
          <div className="flex items-center text-gray-700">
              <div className="w-3 h-3 bg-green-500 mr-2 rounded-full shadow-sm"></div> Generación
          </div>
          <div className="flex items-center text-gray-700">
              <div className="w-3 h-3 bg-sky-500 mr-2 rounded-full shadow-sm"></div> Demanda
          </div>
      </div>
    </div>
  );
};
