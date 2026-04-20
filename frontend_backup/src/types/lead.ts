export type LeadSource = "LINKEDIN" | "APOLLO" | "HUNTER" | "MANUAL";
export type LeadStatus = "NEW" | "CONTACTED" | "REPLIED" | "CLOSED";

export type Lead = {
  id: string;
  companyId: string;
  contactId: string;
  source: LeadSource;
  status: LeadStatus;
  createdAt: string;
};

export type CreateLeadRequest = {
  companyId: string;
  contactId: string;
  source: LeadSource;
};
