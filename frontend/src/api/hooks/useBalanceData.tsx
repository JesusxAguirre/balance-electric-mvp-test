import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { BackendBalanceResponse, BalanceRecord } from '../../types/balance';

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const API_BASE_URL = 'http://localhost:3000/api/v1'
const USE_DUMMY = String(import.meta.env.VITE_USE_DUMMY_DATA || 'false') === 'true';

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

    if (USE_DUMMY) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return generateDummyData(startDate, endDate);
    }

    const base = API_BASE_URL || '';
    const endpoint = `${base}/balance`;
    const url = `${endpoint}?start_date=${startDate}T00:00&end_date=${endDate}T23:59`;
    // const url = 'https://apidatos.ree.es/es/datos/balance/balance-electrico?start_date=2025-01-01T00:00&end_date=2025-01-31T23:59&time_trunc=day'
    
    console.log(url);
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const raw: BackendBalanceResponse = await res.json();

    // Map backend entities to frontend BalanceRecord[] aggregating into Generacion vs Demanda by date
    const records: BalanceRecord[] = raw.map((item) => {
      const dateIso = typeof item.date === 'string' ? item.date : new Date(item.date as unknown as string).toISOString().split('T')[0];
      const type: 'Generacion' | 'Demanda' = item.type === 'DEMAND' ? 'Demanda' : 'Generacion';
      return {
        datetime: dateIso,
        type,
        value: Number(item.value),
      };
    });

    return records;
  };
  
  return useQuery<BalanceRecord[], Error>({
    queryKey: ['balance', startDate, endDate],
    queryFn: fetchBalance,
    enabled: !!startDate && !!endDate, 
  });
};
