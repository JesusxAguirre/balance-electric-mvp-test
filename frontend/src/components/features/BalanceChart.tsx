import { useMemo } from "react";
// Importamos los tipos y las utilidades de display para usar los nombres en español
import { 
    EnergyType, 
    EnergyTypeDisplayNames, 
    type BalanceRecord 
} from "../../types/energy.enums";

/** * Define la estructura de los datos agrupados para el gráfico. 
 * Las propiedades serán dinámicas basadas en los valores de EnergyType.
 */
interface DynamicChartDataPoint {
    date: string;
    // Permite el acceso dinámico usando los valores del enum EnergyType (p.ej., 'RENEWABLE')
    [key: string]: string | number; 
}

interface BalanceChartProps {
    data: BalanceRecord[]; // Espera datos crudos tipificados con EnergyType/Subtype
}

// Mapeo simple de colores para los tipos de energía (puedes expandir esto)
const TYPE_COLORS: Record<EnergyType, string> = {
    [EnergyType.RENEWABLE]: 'bg-green-500', // Generación (Renovable)
    [EnergyType.NON_RENEWABLE]: 'bg-yellow-600', // Generación (No Renovable)
    [EnergyType.STORAGE]: 'bg-indigo-500', // Almacenamiento
    [EnergyType.DEMAND]: 'bg-sky-500', // Demanda
    // Añade más si incluyes otros tipos
};

export const BalanceChart: React.FC<BalanceChartProps> = ({ data }) => {
  
  // 1. Mapeo y agrupamiento de datos (Dinámico)
  const { chartData, availableTypes } = useMemo(() => {
    const dateMap: { [key: string]: DynamicChartDataPoint } = {};
    const uniqueTypes = new Set<EnergyType>();

    data.forEach(item => {
      const date = item.datetime.split('T')[0];
      const typeKey = item.type; // Usamos directamente el valor del enum (ej. 'RENEWABLE')

      // 1a. Acumular tipos únicos
      if (Object.values(EnergyType).includes(typeKey as EnergyType)) {
        uniqueTypes.add(typeKey as EnergyType);
      } else {
        // Ignorar tipos no reconocidos si es necesario
        return; 
      }
      
      // 1b. Inicializar el punto de datos
      if (!dateMap[date]) {
        // Inicializa solo la fecha. Los tipos se inicializarán a 0 dinámicamente.
        dateMap[date] = { date: date };
      }

      // 1c. Sumar el valor en el campo dinámico
      if (dateMap[date][typeKey] === undefined) {
          dateMap[date][typeKey] = 0;
      }
      (dateMap[date][typeKey] as number) += item.value;
    });

    // Asegurarse de que todos los puntos de datos tengan 0 para los tipos que faltan en ese día.
    const finalData = Object.values(dateMap).map(dayData => {
        [...uniqueTypes].forEach(type => {
            if (dayData[type] === undefined) {
                dayData[type] = 0;
            }
        });
        return dayData;
    });

    return {
        chartData: finalData,
        availableTypes: [...uniqueTypes].sort() // Ordenar para consistencia
    };

  }, [data]);
  
  if (chartData.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500 bg-white rounded-lg border border-gray-200">
        No hay datos de energía para mostrar en este rango.
      </div>
    );
  }
  
  // 2. Cálculo de máximos
  // Calcular el máximo de la suma de todos los tipos para cada día
  const dailySums = chartData.map(d => {
      return availableTypes.reduce((sum, type) => sum + (d[type] as number), 0);
  });

  const overallMax = Math.max(...dailySums) * 1.1; // 10% de margen
  
  // Ancho de cada grupo de barras (ajustado para ser más delgado)
  const barGroupWidth = 10; 
  // Ancho de cada barra individual dentro del grupo (aproximadamente la mitad)
  const individualBarWidth = (barGroupWidth / availableTypes.length) * 0.95; 

  return (
    <div className="w-full h-[500px] p-6 bg-white rounded-lg shadow-xl border border-gray-200 overflow-x-auto">
      <h3 className="text-xl font-semibold mb-4 text-gray-900">Balance Eléctrico Diario por Tipo (MWh)</h3>
      <div className="h-[calc(100%-40px)] flex">
          
          {/* Eje Y simplificado */}
          <div className="flex flex-col justify-between text-xs text-gray-500 pr-2 pb-6 pt-4">
              <span>{Math.round(overallMax / 1000) * 1000}</span>
              <span>{Math.round(overallMax / 2 / 1000) * 1000}</span>
              <span>0</span>
          </div>

          <div className="flex items-end h-full w-full min-w-[700px] pb-6 border-l border-b border-gray-300 relative">
            
            {chartData.map((d, index) => (
              // Contenedor de todas las barras para un día específico
              <div 
                key={index} 
                className={`flex flex-col items-center flex-shrink-0 justify-end h-full mx-1`}
                style={{ width: `${barGroupWidth * availableTypes.length}px` }} // Ancho del grupo ajustado
              >
                
                {/* Contenedor de las barras */}
                <div className="flex items-end w-full h-full relative group">
                    
                    {/* Renderizado Dinámico de Barras */}
                    {availableTypes.map(type => {
                        const value = (d[type] as number);
                        if (value === 0) return null; // No renderizar si el valor es 0

                        const colorClass = TYPE_COLORS[type] || 'bg-gray-400';
                        
                        // Tooltip dinámico
                        const tooltipContent = `${EnergyTypeDisplayNames[type]}: ${Math.round(value)} MWh`;

                        return (
                          <div 
                            key={type}
                            title={tooltipContent}
                            className={`${colorClass} transition-all duration-500 rounded-t-sm relative hover:opacity-80`}
                            style={{ 
                                height: `${(value / overallMax) * 100}%`,
                                width: `${individualBarWidth}px`,
                                marginRight: '1px',
                            }}
                          >
                              {/* Tooltip visible en hover */}
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-gray-800 text-white text-[10px] p-1 rounded whitespace-nowrap opacity-0 transition-opacity z-10 pointer-events-none group-hover:opacity-100">
                                  {tooltipContent}
                              </div>
                          </div>
                        );
                    })}
                </div>

                {/* Etiqueta de fecha */}
                <div className="absolute bottom-0 text-[10px] text-gray-500 mt-2">
                  {d.date.substring(5)}
                </div>
              </div>
            ))}
          </div>
      </div>
        
      {/* Leyenda Dinámica */}
      <div className="flex justify-center space-x-6 mt-4 text-sm flex-wrap">
          {availableTypes.map(type => (
              <div key={type} className="flex items-center text-gray-700 mt-2">
                  <div className={`w-3 h-3 ${TYPE_COLORS[type] || 'bg-gray-400'} mr-2 rounded-full shadow-sm`}></div> 
                  {EnergyTypeDisplayNames[type]}
              </div>
          ))}
      </div>
    </div>
  );
};