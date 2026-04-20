import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { STORAGE_KEYS } from "../../utils/constants";

type RequireAuthProps = {
  children: ReactNode;
};

export function RequireAuth({ children }: RequireAuthProps) {
  const location = useLocation();
  const token = localStorage.getItem(STORAGE_KEYS.token);

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
