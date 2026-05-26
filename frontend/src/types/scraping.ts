export interface ScrapedCompany {
  razonSocial: string;
  nombreComercial?: string;
  nit?: string;
  telefonos: string[];
  celulares: string[];
  emails: string[];
  website?: string;
  ciudad?: string;
  departamento?: string;
  direccion?: string;
  actividadEconomica?: string;
  industria?: string;
  empleados?: string;
  representanteLegal?: string;
  estadoEmpresa?: string;
  redesSociales: {
    linkedin?: string;
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
  descripcion?: string;
  keywords: string[];
  qualityScore: number;
  sourceUrl?: string;
}

export type ScrapingInputType = 'url' | 'name' | 'nit' | 'auto';

export interface ScrapingRequest {
  input: string;
  type: ScrapingInputType;
}

export type ScrapingMethod = 'fetch' | 'puppeteer' | 'cheerio' | 'ai' | 'manual';

export interface ScrapingResponse {
  success: boolean;
  data?: ScrapedCompany;
  error?: string;
  duration?: number;
  method?: ScrapingMethod;
}

export interface ScrapingHistoryItem {
  id: string;
  input: string;
  status: 'success' | 'error' | 'pending';
  company?: ScrapedCompany;
  error?: string;
  timestamp: string;
  duration?: number;
  method?: ScrapingMethod;
  saved: boolean;
}

export interface ScrapingStats {
  total: number;
  successful: number;
  failed: number;
  lastRun?: string;
}
