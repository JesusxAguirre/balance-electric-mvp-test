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
      return rows.map((r) => ({
        datetime: r.timeGroup,
        type: (r.type || opts.type || EnergyType.STORAGE) as EnergyType,
        subtype: (r.subtype || opts.subtype || EnergySubtype.STORAGE_BALANCE) as EnergySubtype,
        value: Number(r.totalValue),
      })) as BalanceRecord[];
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