import { useEffect, useState } from "react";
import { listCompanies } from "../services/company.service";
import type { Company } from "../types/company";

export function useCompanies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await listCompanies();
      setCompanies(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar las empresas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  return { companies, loading, error, refresh };
}
