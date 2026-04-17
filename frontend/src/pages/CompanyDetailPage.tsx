import { useParams } from "react-router-dom";

export function CompanyDetailPage() {
  const { id } = useParams();

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <div className="rounded-3xl bg-white p-5 shadow-sm border xl:col-span-2">
        <h1 className="text-2xl font-bold">Detalle de empresa</h1>
        <p className="mt-2 text-sm text-slate-500">ID: {id}</p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border p-4">
            <h3 className="font-semibold">Datos generales</h3>
            <p className="mt-2 text-sm text-slate-600">Nombre, país, departamento, LinkedIn.</p>
          </div>
          <div className="rounded-2xl border p-4">
            <h3 className="font-semibold">Contactos</h3>
            <p className="mt-2 text-sm text-slate-600">HR, CTO, CEO, Talent Manager.</p>
          </div>
          <div className="rounded-2xl border p-4">
            <h3 className="font-semibold">Leads</h3>
            <p className="mt-2 text-sm text-slate-600">Estado, origen y trazabilidad.</p>
          </div>
          <div className="rounded-2xl border p-4">
            <h3 className="font-semibold">Emails</h3>
            <p className="mt-2 text-sm text-slate-600">Envíos automáticos y auditoría.</p>
          </div>
        </div>
      </div>

      <aside className="rounded-3xl bg-white p-5 shadow-sm border">
        <h2 className="text-lg font-semibold">Acciones rápidas</h2>
        <div className="mt-4 space-y-3">
          <button className="w-full rounded-2xl border px-4 py-3 text-left">Registrar contacto</button>
          <button className="w-full rounded-2xl border px-4 py-3 text-left">Enviar email</button>
          <button className="w-full rounded-2xl border px-4 py-3 text-left">Agendar reunión</button>
        </div>
      </aside>
    </div>
  );
}