import { api } from "./api";
import type { LoginResponse } from "../types/auth";

export async function login(username: string, password: string): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/auth/login", { username, password });
  localStorage.setItem("accessToken", data.accessToken);
  localStorage.setItem("userRole", data.role);
  localStorage.setItem("username", data.username);
  localStorage.setItem("userId", data.userId);
  return data;
}

export function logout() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("userRole");
  localStorage.removeItem("username");
  localStorage.removeItem("userId");
}