import { api } from "./api";
import { API_PATHS, STORAGE_KEYS } from "../utils/constants";
import type { LoginResponse } from "../types/auth";

export async function login(username: string, password: string): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>(API_PATHS.authLogin, { username, password });

  localStorage.setItem(STORAGE_KEYS.token, data.accessToken);
  localStorage.setItem(STORAGE_KEYS.role, data.role);
  localStorage.setItem(STORAGE_KEYS.username, data.username);
  localStorage.setItem(STORAGE_KEYS.userId, data.userId);

  return data;
}

export function logout() {
  localStorage.removeItem(STORAGE_KEYS.token);
  localStorage.removeItem(STORAGE_KEYS.role);
  localStorage.removeItem(STORAGE_KEYS.username);
  localStorage.removeItem(STORAGE_KEYS.userId);
}
