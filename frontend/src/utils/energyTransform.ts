import type { BalanceRecord, EnergyType } from "@/types/energy.enums";

// Agrupa los registros por fecha (ya tenías esto)
export function groupBalanceByDate(
  records: Pick<BalanceRecord, "datetime" | "value">[]
): { date: string; total: number }[] {
  const map = new Map<string, number>();
  for (const rec of records) {
    const current = map.get(rec.datetime) ?? 0;
    map.set(rec.datetime, current + rec.value);
  }
  return Array.from(map.entries()).map(([date, total]) => ({ date, total }));
}

// Nuevo helper: agrupa los registros por tipo de energía
export function groupByEnergyType(
  records: BalanceRecord[]
): Record<EnergyType, Pick<BalanceRecord, "datetime" | "value">[]> {
  return records.reduce((acc, record) => {
    if (!acc[record.type]) acc[record.type] = [];
    acc[record.type].push({ datetime: record.datetime, value: record.value });
    return acc;
  }, {} as Record<EnergyType, Pick<BalanceRecord, "datetime" | "value">[]>);
}
