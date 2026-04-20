import { useEffect, useState } from "react";
import { getDashboardKpis } from "../services/dashboard.service";
import type { DashboardKpis } from "../types/dashboard";

export function useDashboardKpis() {
  const [kpis, setKpis] = useState<DashboardKpis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardKpis()
      .then(setKpis)
      .catch(() => setKpis(null))
      .finally(() => setLoading(false));
  }, []);

  return { kpis, loading };
}
