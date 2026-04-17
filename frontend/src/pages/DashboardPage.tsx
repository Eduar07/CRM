export function DashboardPage() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <div className="rounded-3xl bg-white p-5 shadow-sm border">
        <p className="text-sm text-slate-500">Empresas</p>
        <h3 className="mt-2 text-3xl font-bold">128</h3>
      </div>
      <div className="rounded-3xl bg-white p-5 shadow-sm border">
        <p className="text-sm text-slate-500">Contactos</p>
        <h3 className="mt-2 text-3xl font-bold">314</h3>
      </div>
      <div className="rounded-3xl bg-white p-5 shadow-sm border">
        <p className="text-sm text-slate-500">Leads activos</p>
        <h3 className="mt-2 text-3xl font-bold">47</h3>
      </div>
      <div className="rounded-3xl bg-white p-5 shadow-sm border">
        <p className="text-sm text-slate-500">Reuniones</p>
        <h3 className="mt-2 text-3xl font-bold">12</h3>
      </div>

      <div className="md:col-span-2 xl:col-span-4 rounded-3xl bg-white p-5 shadow-sm border">
        <h3 className="text-lg font-semibold">Actividad reciente</h3>
        <div className="mt-4 space-y-3 text-sm text-slate-700">
          <p>• Email enviado a CTO de Empresa X</p>
          <p>• Reunión agendada con Marcela Admin</p>
          <p>• Lead actualizado a REPLIED</p>
        </div>
      </div>
    </div>
  );
}