// hooks/useBalanceData.ts

import { EnergySubtype, EnergyType, type BackendAggregatedRow, type BackendBalanceEntity, type BackendBalanceResponse, type BalanceQueryParams, type BalanceRecord, type DataFilterBy } from '@/types/energy.enums';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';

const API_BASE_URL = 'http://localhost:3000/api/v1';

/**
 * Custom hook para obtener datos del balance eléctrico usando @tanstack/react-query.
 * @param startDate - Formato YYYY-MM-DD
 * @param endDate - Formato YYYY-MM-DD
 * @param opts - Opciones de filtrado (type, subtype, time_grouping)
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
    // Si la fecha de inicio o fin no existe, devuelve un array vacío (la query no se habilitará de todas formas)
    if (!startDate || !endDate) return [];

    const base = API_BASE_URL || '';
    const endpoint = `${base}/balance`;
    
    // Construye parámetros de URL
    const params: BalanceQueryParams = {
      // Usar formato ISO completo para evitar ambigüedades de zona horaria
      start_date: startDate.includes('T') ? startDate : `${startDate}T00:00:00.000Z`,
      end_date: endDate.includes('T') ? endDate : `${endDate}T23:59:59.999Z`,
      ...(opts?.type && { type: opts.type }),
      ...(opts?.subtype && { subtype: opts.subtype }),
      ...(opts?.time_grouping && { time_grouping: opts.time_grouping }),
    };

    const stringParams: Record<string, string> = Object.entries(params).reduce(
      (acc, [key, val]) => {
        if (val !== undefined && val !== null) {
          acc[key] = String(val);
        }
        return acc;
      },
      {} as Record<string, string>
    );
    
    const qs = new URLSearchParams(stringParams).toString();
    const url = `${endpoint}?${qs}`;
    
    // Fetch data
    const res = await fetch(url, { 
      headers: { 'Accept': 'application/json' },
      mode: 'cors',
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('API Error:', res.status, errorText);
      throw new Error(`HTTP ${res.status}: ${errorText}`);
    }
    
    const raw: BackendBalanceResponse = await res.json();

    // --- Data Transformation ---

    // 1. Handle Aggregated Data (BackendAggregatedRow[])
    if (opts?.time_grouping) {
      const rows = raw as BackendAggregatedRow[];
      return rows.map((r) => {
        // For monthly grouping, backend returns 'YYYY-MM', convert to first day for consistent date handling
        let datetime = r.timeGroup;
        if (opts.time_grouping === 'month' && /^\d{4}-\d{2}$/.test(datetime)) {
          datetime = `${datetime}-01`; // Add day to make it a valid date
        }
        
        return {
          datetime,
          type: (r.type || opts.type || EnergyType.STORAGE) as EnergyType,
          subtype: (r.subtype || opts.subtype || EnergySubtype.STORAGE_BALANCE) as EnergySubtype,
          value: Number(r.totalValue),
        };
      }) as BalanceRecord[];
    }

    // 2. Handle Non-Aggregated Data (BackendBalanceEntity[])
    const entities = raw as BackendBalanceEntity[];
    
    if (!Array.isArray(entities)) {
      console.error('Expected array but got:', entities);
      return [];
    }

    return entities.map((item) => {
      const dateIso = typeof item.date === 'string' 
        ? item.date.split('T')[0]
        : new Date(item.date).toISOString().split('T')[0];

      return { 
        datetime: dateIso, 
        type: item.type as EnergyType,      // <-- Usamos el tipo directo
        subtype: item.subtype as EnergySubtype, // <-- Usamos el subtipo directo
        value: Number(item.value) 
      } as BalanceRecord;
    });
  };
  
  return useQuery<BalanceRecord[], Error>({
    queryKey: ['balance', startDate, endDate, opts?.type, opts?.subtype, opts?.time_grouping],
    queryFn: fetchBalance,
    // La query solo se habilita si hay fechas válidas
    enabled: !!startDate && !!endDate, 
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });
};

// ============================================================================
// HELPERS PARA EL DASHBOARD
// ============================================================================

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

/**
 * Get the date range for the last N years
 */
export function getLastYearsRange(years: number = 5): { start: string; end: string } {
  const now = new Date();
  const endYear = now.getFullYear();
  const startYear = endYear - years + 1;
  
  const start = `${startYear}-01-01`;
  const end = `${endYear}-12-31`;
  
  return { start, end };
}

/**
 * Hook to fetch balance data for the last 5 years grouped by month
 */
export function useLastFiveYearsByMonth(options?: { type?: EnergyType; subtype?: EnergySubtype }) {
  const { start, end } = getLastYearsRange(5);
  return useBalanceData(start, end, { time_grouping: 'month', ...options });
}

/**
 * Hook to fetch categorized balance data (grouped by energy type)
 * Returns: { RENEWABLE: [...], NON_RENEWABLE: [...], STORAGE: [...], DEMAND: [...] }
 */
export function useCategorizedBalanceData(
  startDate: string,
  endDate: string,
  opts?: { time_grouping?: DataFilterBy; subtype?: EnergySubtype }
) {
  return useQuery({
    queryKey: ['balance', 'categorized', startDate, endDate, opts],
    queryFn: async () => {
      if (!startDate || !endDate) return null;

      const base = API_BASE_URL || '';
      const endpoint = `${base}/balance/categorized`;
      
      const params = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
      });

      if (opts?.time_grouping) {
        params.append('time_grouping', opts.time_grouping);
      }
      if (opts?.subtype) {
        params.append('subtype', opts.subtype);
      }

      const res = await fetch(`${endpoint}?${params.toString()}`);

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`HTTP ${res.status}: ${errorText}`);
      }

      const data = await res.json();
      return data;
    },
    enabled: !!startDate && !!endDate,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook for categorized data of current year by month
 */
export function useCurrentYearCategorizedByMonth() {
  const { start, end } = getCurrentYearRange();
  return useCategorizedBalanceData(start, end, { time_grouping: 'month' });
}