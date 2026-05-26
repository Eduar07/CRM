import axios from "axios";
import type {
  ScrapingRequest,
  ScrapingResponse,
  ScrapedCompany,
} from "../types/scraping";
import { api } from "./api";
import { STORAGE_KEYS } from "../utils/constants";

const scraperApi = axios.create({
  baseURL: import.meta.env.VITE_SCRAPER_URL ?? "/scraper-api",
  timeout: 90_000,
});

export async function scrapeCompany(
  request: ScrapingRequest
): Promise<ScrapingResponse> {
  const { data } = await scraperApi.post<ScrapingResponse>(
    "/api/scrape",
    request
  );
  return data;
}

export async function extractWithAI(
  content: string
): Promise<ScrapingResponse> {
  const { data } = await scraperApi.post<ScrapingResponse>(
    "/api/extract/ai",
    { content }
  );
  return data;
}

export async function extractFromHTML(
  html: string
): Promise<ScrapingResponse> {
  const { data } = await scraperApi.post<ScrapingResponse>(
    "/api/extract/html",
    { html }
  );
  return data;
}

/**
 * Save a scraped company to the CRM with ALL extracted fields.
 */
export async function saveScrapedCompany(
  company: ScrapedCompany
): Promise<void> {
  const linkedin = company.redesSociales?.linkedin?.trim() ?? "";

  // Combine landlines + mobiles into a single comma-separated string
  const allPhones = [
    ...(company.telefonos ?? []),
    ...(company.celulares ?? []),
  ].filter(Boolean).join(", ");

  const allEmails = (company.emails ?? []).filter(Boolean).join(", ");

  const payload = {
    name: (company.razonSocial || company.nombreComercial || "Sin nombre").trim(),
    linkedinUrl: linkedin,
    country: "Colombia",
    department: company.departamento ?? "",
    industry: company.industria ?? "",
    size: company.empleados ?? "",
    website: company.website ?? "",
    assignedTo: localStorage.getItem(STORAGE_KEYS.username) ?? "",
    nit: company.nit ?? "",
    phones: allPhones,
    emails: allEmails,
    address: company.direccion ?? "",
    legalRep: company.representanteLegal ?? "",
    companyState: company.estadoEmpresa ?? "",
    description: company.descripcion ?? "",
  };

  try {
    await api.post("/companies", payload);
  } catch (err: unknown) {
    const status = (err as { status?: number }).status;
    if (status === 400 && !linkedin && company.sourceUrl) {
      await api.post("/companies", {
        ...payload,
        linkedinUrl: company.sourceUrl,
      });
      return;
    }
    throw err;
  }
}
