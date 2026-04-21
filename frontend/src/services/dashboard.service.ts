import { api } from "./api";
import type { DashboardKpis } from "../types/dashboard";

export async function getDashboardKpis(): Promise<DashboardKpis> {
  const { data } = await api.get<DashboardKpis>("/dashboard/kpis");
  return data;
}

export type WeeklyActivity = {
  day: string;
  emails: number;
  calls: number;
  meetings: number;
};

export async function getWeeklyActivity(): Promise<WeeklyActivity[]> {
  try {
    const { data } = await api.get<WeeklyActivity[]>("/dashboard/weekly-activity");
    return data;
  } catch {
    // Backend aún no tiene el endpoint: devolver vacío para que el gráfico muestre empty state
    return [];
  }
}
