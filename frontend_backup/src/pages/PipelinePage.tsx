import { useEffect, useState } from "react";
import { EmptyState, Loader } from "../components/common";
import { PipelineBoard } from "../components/lead/PipelineBoard";
import { useCompanies } from "../hooks/useCompanies";
import { usePipeline } from "../hooks/usePipeline";

export function PipelinePage() {
  const { companies, loading: loadingCompanies, error: companiesError } = useCompanies();
  const [companyId, setCompanyId] = useState("");
  const { byStage, loading: loadingPipeline, error: pipelineError, leads } = usePipeline(companyId || undefined);

  useEffect(() => {
    if (!companyId && companies.length > 0) {
      setCompanyId(companies[0].id);
    }
  }, [companyId, companies]);

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-bold text-slate-900">Pipeline</h1>
          <select
            className="w-full max-w-sm rounded-2xl border px-4 py-2 text-sm"
            value={companyId}
            onChange={(event) => setCompanyId(event.target.value)}
            disabled={loadingCompanies || companies.length === 0}
          >
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loadingCompanies ? <Loader text="Cargando empresas..." /> : null}
      {companiesError ? <EmptyState title="No se pudieron cargar las empresas" description={companiesError} /> : null}
      {!loadingCompanies && !companiesError && !companyId ? (
        <EmptyState title="Sin empresa seleccionada" description="Selecciona una empresa para cargar su pipeline." />
      ) : null}

      {loadingPipeline ? <Loader text="Cargando pipeline..." /> : null}
      {pipelineError ? <EmptyState title="No se pudo cargar el pipeline" description={pipelineError} /> : null}
      {!loadingPipeline && !pipelineError && companyId && leads.length === 0 ? (
        <EmptyState title="Sin leads" description="No hay leads registrados para esta empresa." />
      ) : null}
      {!loadingPipeline && !pipelineError && leads.length > 0 ? <PipelineBoard byStage={byStage} /> : null}
    </div>
  );
}
