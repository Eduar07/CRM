import { EmptyState, Loader } from "../components/common";
import { MeetingList } from "../components/meeting/MeetingList";
import { useMeetings } from "../hooks/useMeetings";

export function MeetingsPage() {
  const userId = localStorage.getItem("userId") ?? undefined;
  const { meetings, loading, error } = useMeetings(userId);

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <div className="rounded-3xl border bg-white p-5 shadow-sm xl:col-span-2">
        <h1 className="text-xl font-bold text-slate-900">Agenda</h1>
        <div className="mt-4">
          {loading ? <Loader text="Cargando agenda..." /> : null}
          {error ? <EmptyState title="No se pudieron cargar las reuniones" description={error} /> : null}
          {!loading && !error && meetings.length === 0 ? (
            <EmptyState title="Sin reuniones" description="No hay reuniones agendadas para este usuario." />
          ) : null}
          {!loading && !error && meetings.length > 0 ? <MeetingList meetings={meetings} /> : null}
        </div>
      </div>

      <aside className="rounded-3xl border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Programar reunión</h2>
        <form className="mt-4 space-y-3">
          <input className="w-full rounded-2xl border px-4 py-3 text-sm" placeholder="Título" />
          <input className="w-full rounded-2xl border px-4 py-3 text-sm" placeholder="Start time" />
          <input className="w-full rounded-2xl border px-4 py-3 text-sm" placeholder="End time" />
          <button className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white" type="button">
            Agendar
          </button>
        </form>
      </aside>
    </div>
  );
}
