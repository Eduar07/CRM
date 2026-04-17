export type ContactRole = "HR" | "TALENT_MANAGER" | "CTO" | "CEO";

export type Contact = {
  id: string;
  companyId: string;
  name: string;
  email: string;
  role: ContactRole;
};

export type CreateContactRequest = {
  companyId: string;
  name: string;
  email: string;
  role: ContactRole;
};
