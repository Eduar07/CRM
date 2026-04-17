import { useParams } from "react-router-dom";
import { CompanyDetail } from "../components/company/CompanyDetail";
import { EmptyState, Loader } from "../components/common";
import { useCompanyDetail } from "../hooks/useCompanyDetail";

export function CompanyDetailPage() {
  const { id } = useParams();
  const { company, loading, error } = useCompanyDetail(id);

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <div className="rounded-3xl border bg-white p-5 shadow-sm xl:col-span-2">
        <h1 className="text-2xl font-bold text-slate-900">Detalle de empresa</h1>
        <p className="mt-2 text-sm text-slate-500">ID: {id}</p>

        <div className="mt-6">
          {loading ? <Loader text="Cargando detalle de empresa..." /> : null}
          {error ? <EmptyState title="No se pudo cargar la empresa" description={error} /> : null}
          {!loading && !error && company ? <CompanyDetail company={company} /> : null}
        </div>
      </div>

      <aside className="rounded-3xl border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Acciones rápidas</h2>
        <div className="mt-4 space-y-3">
          <button className="w-full rounded-2xl border px-4 py-3 text-left">Registrar contacto</button>
          <button className="w-full rounded-2xl border px-4 py-3 text-left">Enviar email</button>
          <button className="w-full rounded-2xl border px-4 py-3 text-left">Agendar reunión</button>
        </div>
      </aside>
    </div>
  );
}
