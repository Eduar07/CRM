export function MeetingsPage() {
  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <div className="rounded-3xl bg-white p-5 shadow-sm border xl:col-span-2">
        <h1 className="text-xl font-bold">Agenda</h1>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b text-slate-500">
              <tr>
                <th className="py-3 pr-4">Hora</th>
                <th className="py-3 pr-4">Título</th>
                <th className="py-3 pr-4">Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-3 pr-4">10:00</td>
                <td className="py-3 pr-4">Reunión con Empresa X</td>
                <td className="py-3 pr-4">SCHEDULED</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <aside className="rounded-3xl bg-white p-5 shadow-sm border">
        <h2 className="text-lg font-semibold">Programar reunión</h2>
        <form className="mt-4 space-y-3">
          <input className="w-full rounded-2xl border px-4 py-3 text-sm" placeholder="Título" />
          <input className="w-full rounded-2xl border px-4 py-3 text-sm" placeholder="Start time" />
          <input className="w-full rounded-2xl border px-4 py-3 text-sm" placeholder="End time" />
          <button className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white">
            Agendar
          </button>
        </form>
      </aside>
    </div>
  );
}