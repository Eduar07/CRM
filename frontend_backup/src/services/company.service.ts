import { api } from "./api";
import { API_PATHS } from "../utils/constants";
import type { Company, CreateCompanyRequest } from "../types/company";

export async function listCompanies(): Promise<Company[]> {
  const { data } = await api.get<Company[]>(API_PATHS.companies);
  return data;
}

export async function getCompanyById(companyId: string): Promise<Company> {
  const { data } = await api.get<Company>(`${API_PATHS.companies}/${companyId}`);
  return data;
}

export async function createCompany(payload: CreateCompanyRequest): Promise<Company> {
  const { data } = await api.post<Company>(API_PATHS.companies, payload);
  return data;
}
