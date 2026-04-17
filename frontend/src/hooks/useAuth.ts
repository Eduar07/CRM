import { useMemo } from "react";
import { login, logout } from "../services/auth.service";
import { STORAGE_KEYS } from "../utils/constants";

export function useAuth() {
  const authState = useMemo(() => {
    const accessToken = localStorage.getItem(STORAGE_KEYS.token);
    const userId = localStorage.getItem(STORAGE_KEYS.userId);
    const username = localStorage.getItem(STORAGE_KEYS.username);
    const role = localStorage.getItem(STORAGE_KEYS.role);

    return {
      isAuthenticated: Boolean(accessToken),
      accessToken,
      userId,
      username,
      role
    };
  }, []);

  return {
    ...authState,
    login,
    logout
  };
}
