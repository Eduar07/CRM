import { useEffect, useState } from "react";
import { getCompanyById } from "../services/company.service";
import type { Company } from "../types/company";

export function useCompanyDetail(companyId?: string) {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(Boolean(companyId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!companyId) {
      setCompany(null);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);

    getCompanyById(companyId)
      .then((result) => {
        if (active) {
          setCompany(result);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? err.message : "No se pudo cargar la empresa");
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [companyId]);

  return { company, loading, error };
}
