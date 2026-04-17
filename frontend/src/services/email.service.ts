import { api } from "./api";
import { API_PATHS } from "../utils/constants";
import type { EmailRecord, SendEmailRequest } from "../types/email";

export async function listEmailsByContact(contactId: string): Promise<EmailRecord[]> {
  const { data } = await api.get<EmailRecord[]>(API_PATHS.emails, {
    params: { contactId }
  });
  return data;
}

export async function sendProspectionEmail(payload: SendEmailRequest): Promise<void> {
  await api.post(`${API_PATHS.emails}/prospection`, payload);
}
