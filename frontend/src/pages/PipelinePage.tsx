import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useCompanies } from "../hooks/useCompanies";
import { Loader, EmptyState } from "../components/common";
import type { ContactStatus, Company } from "../types/company";

const STAGES: ContactStatus[] = ["Nueva", "Contactada", "En proceso", "Cerrada"];

const STAGE_CFG: Record<ContactStatus, { header: string; dot: string }> = {
  "Nueva":      { header: "bg-gray-100 text-gray-700",   dot: "bg-gray-400"   },
  "Contactada": { header: "bg-blue-100 text-blue-700",   dot: "bg-blue-500"   },
  "En proceso": { header: "bg-amber-100 text-amber-700", dot: "bg-amber-400"  },
  "Cerrada":    { header: "bg-green-100 text-green-700", dot: "bg-green-500"  },
};

function CompanyCard({ company }: { company: Company }) {
  return (
    <Link to={`/companies/${company.id}`}
      className="block rounded-xl border border-gray-200 bg-white p-3 shadow-sm hover:shadow-md transition-shadow">
      <p className="text-sm font-semibold text-gray-900 truncate">{company.name}</p>
      {company.industry && <p className="text-xs text-gray-500 mt-0.5">{company.industry}</p>}
      {company.assignedTo && (
        <div className="mt-2 flex items-center gap-1">
          <div className="h-4 w-4 rounded-full bg-gray-300 flex items-center justify-center text-[8px] font-bold text-gray-600">
            {company.assignedTo.slice(0, 1).toUpperCase()}
          </div>
          <span className="text-[11px] text-gray-400">{company.assignedTo}</span>
        </div>
      )}
    </Link>
  );
}

export function PipelinePage() {
  const { companies, loading, error } = useCompanies();

  const byStage = useMemo(() => {
    const map: Record<ContactStatus, Company[]> = { "Nueva": [], "Contactada": [], "En proceso": [], "Cerrada": [] };
    companies.forEach((c) => {
      const stage = c.contactStatus as ContactStatus;
      if (map[stage]) map[stage].push(c);
    });
    return map;
  }, [companies]);

  return (
    <div className="min-h-full bg-gray-50">
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <h1 className="text-lg font-bold text-gray-900">Pipeline</h1>
        <p className="text-sm text-gray-500 mt-0.5">{companies.length} empresas en total</p>
      </div>

      <div className="p-6">
        {loading && <Loader text="Cargando pipeline..." />}
        {error && <EmptyState title="Error" description={error} />}
        {!loading && !error && (
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            {STAGES.map((stage) => {
              const cfg = STAGE_CFG[stage];
              const items = byStage[stage];
              return (
                <div key={stage} className="flex flex-col gap-3">
                  <div className={`flex items-center justify-between rounded-xl px-3 py-2 ${cfg.header}`}>
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
                      <span className="text-xs font-semibold">{stage}</span>
                    </div>
                    <span className="text-xs font-bold">{items.length}</span>
                  </div>
                  <div className="space-y-2">
                    {items.length === 0
                      ? <p className="text-center text-xs text-gray-400 py-6">Sin empresas</p>
                      : items.map((c) => <CompanyCard key={c.id} company={c} />)
                    }
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
