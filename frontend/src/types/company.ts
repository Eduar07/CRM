export type ContactStatus = "Nueva" | "Contactada" | "En proceso" | "Cerrada";

export type Company = {
  id: string;
  name: string;
  industry: string | null;
  size: string | null;
  linkedinUrl: string | null;
  website: string | null;
  country: string;
  department: string | null;
  assignedTo: string | null;
  contactStatus: ContactStatus;
  createdAt: string;
  nit: string | null;
  phones: string | null;
  emails: string | null;
  address: string | null;
  legalRep: string | null;
  companyState: string | null;
  description: string | null;
};

export type CreateCompanyRequest = {
  name: string;
  linkedinUrl?: string;
  country: string;
  department?: string;
  industry?: string;
  size?: string;
  website?: string;
  assignedTo?: string;
  nit?: string;
  phones?: string;
  emails?: string;
  address?: string;
  legalRep?: string;
  companyState?: string;
  description?: string;
};

export type UpdateCompanyRequest = {
  name?: string;
  industry?: string;
  size?: string;
  website?: string;
  country?: string;
  department?: string;
  assignedTo?: string;
  contactStatus?: ContactStatus;
  nit?: string;
  phones?: string;
  emails?: string;
  address?: string;
  legalRep?: string;
  companyState?: string;
  description?: string;
};
