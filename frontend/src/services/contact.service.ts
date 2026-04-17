import { api } from "./api";
import { API_PATHS } from "../utils/constants";
import type { Contact, CreateContactRequest } from "../types/contact";

export async function listContactsByCompany(companyId: string): Promise<Contact[]> {
  const { data } = await api.get<Contact[]>(API_PATHS.contacts, {
    params: { companyId }
  });
  return data;
}

export async function createContact(payload: CreateContactRequest): Promise<Contact> {
  const { data } = await api.post<Contact>(API_PATHS.contacts, payload);
  return data;
}
