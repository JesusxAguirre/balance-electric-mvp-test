//TODO: Remove linter error

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
  FUEL_GAS = "FUEL_GAS",
  COGENERATION = "COGENERATION",
  NON_RENEWABLE_WASTE = "NON_RENEWABLE_WASTE",
  NON_RENEWABLE_GENERATION = "NON_RENEWABLE_GENERATION",

  PUMPING_TURBINE = "PUMPING_TURBINE",
  PUMPING_CONSUMPTION = "PUMPING_CONSUMPTION",
  STORAGE_BALANCE = "STORAGE_BALANCE",
  BATTERY_CHARGE = "BATTERY_CHARGE",
  BATTERY_DELIVERY = "BATERY_DELIVERY",

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

/**
 * Spanish display names for energy types
 */
export const EnergyTypeDisplayNames: Record<EnergyType, string> = {
  [EnergyType.RENEWABLE]: "Renovable",
  [EnergyType.NON_RENEWABLE]: "No-Renovable",
  [EnergyType.STORAGE]: "Almacenamiento",
  [EnergyType.DEMAND]: "Demanda",
};

/**
 * Spanish display names for energy subtypes
 */
export const EnergySubtypeDisplayNames: Record<EnergySubtype, string> = {
  //RENEWABLE
  [EnergySubtype.HYDRAULIC]: "Hidráulica",
  [EnergySubtype.WIND]: "Eólica",
  [EnergySubtype.SOLAR_PHOTOVOLTAIC]: "Solar fotovoltaica",
  [EnergySubtype.SOLAR_THERMAL]: "Solar térmica",
  [EnergySubtype.HYDROEOLIC]: "Hidroeólica",
  [EnergySubtype.OTHER_RENEWABLES]: "Otras renovables",
  [EnergySubtype.RENEWABLE_WASTE]: "Residuos renovables",
  [EnergySubtype.RENEWABLE_GENERATION]: "Generación renovable",
  //NON RENEWABLE
  [EnergySubtype.NUCLEAR]: "Nuclear",
  [EnergySubtype.COMBINED_CYCLE]: "Ciclo combinado",
  [EnergySubtype.CARBON]: "Carbón",
  [EnergySubtype.DIESEL_ENGINE]: "Motores diésel",
  [EnergySubtype.GAS_TURBINE]: "Turbina de gas",
  [EnergySubtype.STEAM_TURBINE]: "Turbina de vapor",
  [EnergySubtype.FUEL_GAS]: "Fuel + Gas",
  [EnergySubtype.COGENERATION]: "Cogeneración",
  [EnergySubtype.NON_RENEWABLE_WASTE]: "Residuos no renovables",
  [EnergySubtype.NON_RENEWABLE_GENERATION]: "Generación no renovable",

  //Storage
  [EnergySubtype.PUMPING_TURBINE]: "Turbinación bombeo",
  [EnergySubtype.PUMPING_CONSUMPTION]: "Consumo bombeo",
  [EnergySubtype.BATTERY_DELIVERY]: "Entrega batería",
  [EnergySubtype.BATTERY_CHARGE]: "Carga batería",

  [EnergySubtype.STORAGE_BALANCE]: "Saldo almacenamiento",

  //Demand
  [EnergySubtype.INTERNATIONAL_BALANCE]: "Saldo I. internacionales",
  [EnergySubtype.BC_DEMAND]: "Demanda en b.c.",
};

/**
 * Get the Spanish display name for an energy type
 * @param type - The energy type enum value
 * @returns The Spanish display name
 */
export function getEnergyTypeDisplayName(type: EnergyType): string {
  return EnergyTypeDisplayNames[type];
}

/**
 * Get the Spanish display name for an energy subtype
 * @param subtype - The energy subtype enum value
 * @returns The Spanish display name
 */
export function getEnergySubtypeDisplayName(subtype: EnergySubtype): string {
  return EnergySubtypeDisplayNames[subtype];
}

/**
 * Get energy type from Spanish display name
 * @param displayName - The Spanish display name
 * @returns The energy type enum value or undefined if not found
 */
export function getEnergyTypeFromDisplayName(
  displayName: string
): EnergyType | undefined {
  return Object.entries(EnergyTypeDisplayNames).find(
    ([_, name]) => name === displayName
  )?.[0] as EnergyType | undefined;
}

/**
 * Get energy subtype from Spanish display name
 * @param displayName - The Spanish display name
 * @returns The energy subtype enum value or undefined if not found
 */
export function getEnergySubtypeFromDisplayName(
  displayName: string
): EnergySubtype | undefined {
  return Object.entries(EnergySubtypeDisplayNames).find(
    ([_, name]) => name === displayName
  )?.[0] as EnergySubtype | undefined;
}

/**
 * Mapping of energy types to their valid subtypes
 */
export const EnergyTypeSubtypeMapping: Record<EnergyType, EnergySubtype[]> = {
  [EnergyType.RENEWABLE]: [
    EnergySubtype.HYDRAULIC,
    EnergySubtype.WIND,
    EnergySubtype.SOLAR_PHOTOVOLTAIC,
    EnergySubtype.SOLAR_THERMAL,
    EnergySubtype.HYDROEOLIC,
    EnergySubtype.OTHER_RENEWABLES,
    EnergySubtype.RENEWABLE_WASTE,
    EnergySubtype.RENEWABLE_GENERATION,
  ],
  [EnergyType.NON_RENEWABLE]: [
    EnergySubtype.NUCLEAR,
    EnergySubtype.COMBINED_CYCLE,
    EnergySubtype.CARBON,
    EnergySubtype.DIESEL_ENGINE,
    EnergySubtype.GAS_TURBINE,
    EnergySubtype.STEAM_TURBINE,
    EnergySubtype.COGENERATION,
    EnergySubtype.NON_RENEWABLE_WASTE,
    EnergySubtype.NON_RENEWABLE_GENERATION,
  ],
  [EnergyType.STORAGE]: [
    EnergySubtype.PUMPING_TURBINE,
    EnergySubtype.PUMPING_CONSUMPTION,
    EnergySubtype.STORAGE_BALANCE,
  ],
  [EnergyType.DEMAND]: [
    EnergySubtype.INTERNATIONAL_BALANCE,
    EnergySubtype.BC_DEMAND,
  ],
};

/**
 * Get the parent energy type for a given subtype
 * @param subtype - The energy subtype
 * @returns The parent energy type
 */
export function getParentEnergyType(
  subtype: EnergySubtype
): EnergyType | undefined {
  for (const [type, subtypes] of Object.entries(EnergyTypeSubtypeMapping)) {
    if (subtypes.includes(subtype)) {
      return type as EnergyType;
    }
  }
  return undefined;
}

export interface BalanceRecord {
  datetime: string;
  type: EnergyType;
  subtype: EnergySubtype;
  value: number;
}
