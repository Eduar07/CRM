export type Company = {
  id: string;
  name: string;
  linkedinUrl: string;
  country: string;
  department: string | null;
  createdAt: string;
};

export type CreateCompanyRequest = {
  name: string;
  linkedinUrl: string;
  country: string;
  department?: string;
};
