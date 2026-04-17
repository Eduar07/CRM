export type EmailStatus = "SENT" | "FAILED";

export type EmailRecord = {
  id: string;
  companyId: string;
  contactId: string;
  toEmail: string;
  subject: string;
  content: string;
  status: EmailStatus;
  sentAt: string;
};

export type SendEmailRequest = {
  companyId: string;
  contactId: string;
};
