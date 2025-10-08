export interface BalanceRecord {
  datetime: string;
  type: "Generacion" | "Demanda" | string;
  value: number;
}

// Backend entity shape (simplified) returned by GET /balance
export interface BackendBalanceEntity {
  id: string;
  type: "RENEWABLE" | "NON_RENEWABLE" | "STORAGE" | "DEMAND" | string;
  subtype: string;
  value: number;
  percentage: number;
  description?: string | null;
  date: string; // ISO date (yyyy-mm-dd)
  createdAt: string;
}

export type BackendBalanceResponse = BackendBalanceEntity[];
