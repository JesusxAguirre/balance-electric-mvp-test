import { useQuery, type UseQueryResult } from '@tanstack/react-query';

const API_BASE_URL = 'http://localhost:3000/balance';

interface BalanceRecord {
    datetime: string; // Formato YYYY-MM-DDTHH:MM:SS
    type: 'Generacion' | 'Demanda' | string;
    value: number; // Valor en MWh o similar
  }

/**
 * Función de generación de datos dummy tipificada para demostración.
 */
const generateDummyData = (start: string, end: string): BalanceRecord[] => {
    const data: BalanceRecord[] = [];
    let currentDate = new Date(start);
    const endDate = new Date(end);
    
    // Generar datos diarios
    while (currentDate <= endDate) {
        const dateString = currentDate.toISOString().split('T')[0];
        data.push({
            datetime: dateString,
            type: 'Generacion',
            value: Math.floor(Math.random() * 5000) + 10000,
        });
        data.push({
            datetime: dateString,
            type: 'Demanda',
            value: Math.floor(Math.random() * 4500) + 9000,
        });
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return data;
};

/**
 * Custom hook para obtener datos del balance eléctrico.
 * @param startDate
 * @param endDate
 * @returns UseQueryResult<BalanceRecord[], Error>
 */
export const useBalanceData = (startDate: string, endDate: string): UseQueryResult<BalanceRecord[], Error> => {
  const fetchBalance = async (): Promise<BalanceRecord[]> => {
    if (!startDate || !endDate) return [];

    const url = `${API_BASE_URL}?start_date=${startDate}T00:00&end_date=${endDate}T23:59`;
    
    // Simulación de latencia de red
    await new Promise(resolve => setTimeout(resolve, 800));

    // Simulación de datos dummy
    return generateDummyData(startDate, endDate);
  };
  
  return useQuery<BalanceRecord[], Error>({
    queryKey: ['balance', startDate, endDate],
    queryFn: fetchBalance,
    enabled: !!startDate && !!endDate, 
  });
};
