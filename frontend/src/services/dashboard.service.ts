import { api } from "./api";
import type { DashboardKpis } from "../types/dashboard";

export async function getDashboardKpis(): Promise<DashboardKpis> {
  const { data } = await api.get<DashboardKpis>("/dashboard/kpis");
  return data;
}
