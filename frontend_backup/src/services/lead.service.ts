import { api } from "./api";
import { API_PATHS } from "../utils/constants";
import type { Lead, CreateLeadRequest } from "../types/lead";

export async function listLeadsByCompany(companyId: string): Promise<Lead[]> {
  const { data } = await api.get<Lead[]>(API_PATHS.leads, {
    params: { companyId }
  });
  return data;
}

export async function createLead(payload: CreateLeadRequest): Promise<Lead> {
  const { data } = await api.post<Lead>(API_PATHS.leads, payload);
  return data;
}
