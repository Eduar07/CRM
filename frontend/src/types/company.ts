export type ContactStatus = "Nueva" | "Contactada" | "En proceso" | "Cerrada";

export type Company = {
  id: string;
  name: string;
  industry: string | null;
  size: string | null;
  linkedinUrl: string;
  website: string | null;
  country: string;
  department: string | null;
  assignedTo: string | null;
  contactStatus: ContactStatus;
  createdAt: string;
};

export type CreateCompanyRequest = {
  name: string;
  linkedinUrl: string;
  country: string;
  department?: string;
  industry?: string;
  size?: string;
  website?: string;
  assignedTo?: string;
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
};
