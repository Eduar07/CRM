import { api } from "./api";
import { API_PATHS } from "../utils/constants";
import type { Company, CreateCompanyRequest, UpdateCompanyRequest } from "../types/company";

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

export async function updateCompany(companyId: string, payload: UpdateCompanyRequest): Promise<Company> {
  const { data } = await api.put<Company>(`${API_PATHS.companies}/${companyId}`, payload);
  return data;
}

export async function deleteCompany(companyId: string): Promise<void> {
  await api.delete(`${API_PATHS.companies}/${companyId}`);
}
