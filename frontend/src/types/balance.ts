export interface BalanceRecord {
  datetime: string;
  type: "Generacion" | "Demanda" | string;
  value: number;
}

// Enums reused from backend for request/response typing
export enum EnergyType {
  RENEWABLE = "RENEWABLE",
  NON_RENEWABLE = "NON_RENEWABLE",
  STORAGE = "STORAGE",
  DEMAND = "DEMAND",
}

export enum EnergySubtype {
  HYDRAULIC = "HYDRAULIC",
  WIND = "WIND",
  SOLAR_PHOTOVOLTAIC = "SOLAR_PHOTOVOLTAIC",
  SOLAR_THERMAL = "SOLAR_THERMAL",
  HYDROEOLIC = "HYDROEOLIC",
  OTHER_RENEWABLES = "OTHER_RENEWABLES",
  RENEWABLE_WASTE = "RENEWABLE_WASTE",
  RENEWABLE_GENERATION = "RENEWABLE_GENERATION",

  NUCLEAR = "NUCLEAR",
  COMBINED_CYCLE = "COMBINED_CYCLE",
  CARBON = "CARBON",
  DIESEL_ENGINE = "DIESEL_ENGINE",
  GAS_TURBINE = "GAS_TURBINE",
  STEAM_TURBINE = "STEAM_TURBINE",
  COGENERATION = "COGENERATION",
  NON_RENEWABLE_WASTE = "NON_RENEWABLE_WASTE",
  NON_RENEWABLE_GENERATION = "NON_RENEWABLE_GENERATION",

  PUMPING_TURBINE = "PUMPING_TURBINE",
  PUMPING_CONSUMPTION = "PUMPING_CONSUMPTION",
  STORAGE_BALANCE = "STORAGE_BALANCE",

  INTERNATIONAL_BALANCE = "INTERNATIONAL_BALANCE",
  BC_DEMAND = "BC_DEMAND",
}

export type DataFilterBy = "year" | "month";

// Backend entity shape (simplified) returned by GET /balance (no aggregation)
export interface BackendBalanceEntity {
  id: string;
  type: EnergyType | string;
  subtype: EnergySubtype | string;
  value: number;
  percentage: number;
  description?: string | null;
  date: string;
  createdAt: string;
}

// Backend aggregated row shape when time_grouping is provided
export interface BackendAggregatedRow {
  totalValue: number;
  timeGroup: string; // 'YYYY' or 'YYYY-MM'
  type?: EnergyType;
  subtype?: EnergySubtype;
}

export type BackendBalanceResponse = Array<
  BackendBalanceEntity | BackendAggregatedRow
>;

export interface BalanceQueryParams {
  start_date: string; // ISO string with time, e.g. 2025-01-01T00:00
  end_date: string; // ISO string with time, e.g. 2025-01-31T23:59
  type?: EnergyType;
  subtype?: EnergySubtype;
  time_grouping?: DataFilterBy;
}
