import { useMemo, useState } from "react";
import { CompanyTable } from "../components/company/CompanyTable";
import { EmptyState, Loader } from "../components/common";
import { useCompanies } from "../hooks/useCompanies";

export function CompaniesPage() {
  const { companies, loading, error } = useCompanies();
  const [query, setQuery] = useState("");

  const filteredCompanies = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return companies;
    }

    return companies.filter((company) => {
      return (
        company.name.toLowerCase().includes(normalized) ||
        company.country.toLowerCase().includes(normalized) ||
        (company.department ?? "").toLowerCase().includes(normalized)
      );
    });
  }, [companies, query]);

  return (
    <div className="rounded-3xl border bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-slate-900">Empresas</h1>
        <input
          className="w-full max-w-xs rounded-2xl border px-4 py-2 text-sm"
          placeholder="Buscar..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      {loading ? <Loader text="Cargando empresas..." /> : null}
      {error ? <EmptyState title="No se pudieron cargar las empresas" description={error} /> : null}
      {!loading && !error && filteredCompanies.length === 0 ? (
        <EmptyState title="No hay empresas" description="No se encontraron resultados para el filtro actual." />
      ) : null}
      {!loading && !error && filteredCompanies.length > 0 ? <CompanyTable items={filteredCompanies} /> : null}
    </div>
  );
}
