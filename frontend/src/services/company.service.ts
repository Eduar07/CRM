import { api } from "./api";
import { API_PATHS } from "../utils/constants";
import type { Company, CreateCompanyRequest, UpdateCompanyRequest } from "../types/company";

/**
 * FIX BUG — URLs con espacios
 * Normaliza una URL antes de enviarla al backend:
 *   1. Hace trim() para quitar espacios al inicio/fin
 *   2. Agrega https:// si no tiene protocolo
 *   3. Codifica espacios internos como %20
 */
function sanitizeUrl(url: string | undefined | null): string | undefined {
  if (!url) return undefined;
  let clean = url.trim();
  if (!clean) return undefined;
  // Agregar protocolo si falta
  if (!/^https?:\/\//i.test(clean)) {
    clean = "https://" + clean;
  }
  // Codificar espacios internos
  clean = clean.replace(/\s+/g, "%20");
  return clean;
}

function sanitizePayload<T extends { linkedinUrl?: string; website?: string }>(payload: T): T {
  return {
    ...payload,
    linkedinUrl: sanitizeUrl(payload.linkedinUrl) ?? payload.linkedinUrl,
    website: sanitizeUrl(payload.website),
  };
}

export async function listCompanies(): Promise<Company[]> {
  const { data } = await api.get<Company[]>(API_PATHS.companies);
  return data;
}

export async function getCompanyById(companyId: string): Promise<Company> {
  const { data } = await api.get<Company>(`${API_PATHS.companies}/${companyId}`);
  return data;
}

export async function createCompany(payload: CreateCompanyRequest): Promise<Company> {
  const { data } = await api.post<Company>(API_PATHS.companies, sanitizePayload(payload));
  return data;
}

export async function updateCompany(companyId: string, payload: UpdateCompanyRequest): Promise<Company> {
  const { data } = await api.put<Company>(`${API_PATHS.companies}/${companyId}`, sanitizePayload(payload));
  return data;
}

export async function deleteCompany(companyId: string): Promise<void> {
  await api.delete(`${API_PATHS.companies}/${companyId}`);
}
