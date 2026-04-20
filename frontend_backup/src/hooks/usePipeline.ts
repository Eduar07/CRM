import { useEffect, useMemo, useState } from "react";
import { listLeadsByCompany } from "../services/lead.service";
import type { Lead, LeadStatus } from "../types/lead";

type PipelineByStage = Record<LeadStatus, Lead[]>;

const EMPTY_PIPELINE: PipelineByStage = {
  NEW: [],
  CONTACTED: [],
  REPLIED: [],
  CLOSED: []
};

export function usePipeline(companyId?: string) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(Boolean(companyId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!companyId) {
      setLeads([]);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);

    listLeadsByCompany(companyId)
      .then((data) => {
        if (active) {
          setLeads(data);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? err.message : "No se pudo cargar el pipeline");
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

  const byStage = useMemo(() => {
    return leads.reduce<PipelineByStage>((acc, lead) => {
      acc[lead.status].push(lead);
      return acc;
    }, structuredClone(EMPTY_PIPELINE));
  }, [leads]);

  return { leads, byStage, loading, error };
}
