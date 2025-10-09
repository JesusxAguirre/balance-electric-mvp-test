import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type {
  BackendBalanceResponse,
  BalanceRecord,
  BalanceQueryParams,
  BackendAggregatedRow,
  BackendBalanceEntity,
  DataFilterBy,
  EnergyType,
  EnergySubtype,
} from '../../types/balance';

const API_BASE_URL = 'http://localhost:3000/api/v1';

/**
 * Custom hook para obtener datos del balance eléctrico.
 * @param startDate - Formato YYYY-MM-DD
 * @param endDate - Formato YYYY-MM-DD
 * @returns UseQueryResult<BalanceRecord[], Error>
 */
export const useBalanceData = (
  startDate: string,
  endDate: string,
  opts?: {
    type?: EnergyType;
    subtype?: EnergySubtype;
    time_grouping?: DataFilterBy;
  }
): UseQueryResult<BalanceRecord[], Error> => {
  const fetchBalance = async (): Promise<BalanceRecord[]> => {
    if (!startDate || !endDate) return [];


    const base = API_BASE_URL || '';
    const endpoint = `${base}/balance`;
    
    // Ensure dates are in correct format with time
    const params: BalanceQueryParams = {
      start_date: startDate.includes('T') ? startDate : `${startDate}T00:00`,
      end_date: endDate.includes('T') ? endDate : `${endDate}T23:59`,
      ...(opts?.type ? { type: opts.type } : {}),
      ...(opts?.subtype ? { subtype: opts.subtype } : {}),
      ...(opts?.time_grouping ? { time_grouping: opts.time_grouping } : {}),
    };

    const stringParams: Record<string, string> = Object.entries(params).reduce(
      (acc, [key, val]) => {
        if (val === undefined || val === null) return acc;
        acc[key] = String(val);
        return acc;
      },
      {} as Record<string, string>
    );
    
    const qs = new URLSearchParams(stringParams).toString();
    const url = `${endpoint}?${qs}`;
    
    console.log('Fetching from:', url); // Debug log
    
    const res = await fetch(url, { 
      headers: { 'Accept': 'application/json' },
      mode: 'cors', // Add CORS mode
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('API Error:', res.status, errorText);
      throw new Error(`HTTP ${res.status}: ${errorText}`);
    }
    
    const raw: BackendBalanceResponse = await res.json();
    console.log('API Response:', raw); // Debug log

    // If time_grouping is provided, backend returns aggregated rows
    if (opts?.time_grouping) {
      const rows = raw as BackendAggregatedRow[];
      return rows.map((r) => ({
        datetime: r.timeGroup,
        type: (r.type === 'DEMAND' ? 'Demanda' : 'Generacion') as 'Generacion' | 'Demanda',
        value: Number(r.totalValue),
      }));
    }

    // Handle the actual backend response structure
    const entities = raw as BackendBalanceEntity[];
    
    if (!Array.isArray(entities)) {
      console.error('Expected array but got:', entities);
      return [];
    }

    return entities.map((item) => {
      // The date field is already a string in YYYY-MM-DD format
      const dateIso = typeof item.date === 'string' 
        ? item.date 
        : new Date(item.date).toISOString().split('T')[0];
      
      // Map backend types to frontend types
      // Adjust this mapping based on your actual backend types
      let type: 'Generacion' | 'Demanda';
      if (item.type === 'DEMAND') {
        type = 'Demanda';
      } else {
        // RENEWABLE, FOSSIL, NUCLEAR, etc. -> Generacion
        type = 'Generacion';
      }
      
      return { 
        datetime: dateIso, 
        type: type, 
        value: Number(item.value) 
      };
    });
  };
  
  return useQuery<BalanceRecord[], Error>({
    queryKey: ['balance', startDate, endDate, opts?.type, opts?.subtype, opts?.time_grouping],
    queryFn: fetchBalance,
    enabled: !!startDate && !!endDate,
    retry: 1, // Retry only once on failure
    staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
  });
};

// Default helpers for current year
export function getCurrentYearRange(): { start: string; end: string } {
  const now = new Date();
  const year = now.getFullYear();
  const start = `${year}-01-01`;
  const end = `${year}-12-31`;
  return { start, end };
}

export function useCurrentYearByMonth(options?: { type?: EnergyType; subtype?: EnergySubtype }) {
  const { start, end } = getCurrentYearRange();
  return useBalanceData(start, end, { time_grouping: 'month', ...options });
}

export function useCurrentYearByYear(options?: { type?: EnergyType; subtype?: EnergySubtype }) {
  const { start, end } = getCurrentYearRange();
  return useBalanceData(start, end, { time_grouping: 'year', ...options });
}