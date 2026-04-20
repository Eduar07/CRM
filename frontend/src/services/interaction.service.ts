import { api } from "./api";
import type { Interaction, CreateInteractionRequest } from "../types/interaction";

export async function listInteractionsByCompany(companyId: string): Promise<Interaction[]> {
  const { data } = await api.get<Interaction[]>(`/interactions/${companyId}`);
  return data;
}

export async function createInteraction(payload: CreateInteractionRequest): Promise<Interaction> {
  const { data } = await api.post<Interaction>("/interactions", payload);
  return data;
}
