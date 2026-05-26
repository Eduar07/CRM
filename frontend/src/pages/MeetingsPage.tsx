import { useEffect, useState } from "react";
import { Calendar, Plus, Video, Clock } from "lucide-react";
import { useMeetings } from "../hooks/useMeetings";
import { useCompanies } from "../hooks/useCompanies";
import { useAuth } from "../hooks/useAuth";
import { scheduleMeeting } from "../services/meeting.service";
import { listContactsByCompany } from "../services/contact.service";
import { Loader, EmptyState } from "../components/common";
import type { Contact } from "../types/contact";

type Toast = { msg: string; type: "success" | "error" } | null;

const INPUT_CLS = "w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-indigo-500";
const SELECT_CLS = "w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 cursor-pointer dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100";

export function MeetingsPage() {
  const { userId } = useAuth();
  const { meetings, loading, error } = useMeetings(userId ?? undefined);
  const { companies } = useCompanies();

  const [toast, setToast] = useState<Toast>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);

  const [form, setForm] = useState({
    companyId: "", contactId: "", title: "", description: "",
    startTime: "", endTime: "", meetingLink: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const now = new Date();
    const later = new Date(now.getTime() + 60 * 60 * 1000);
    const toLocal = (d: Date) => {
      const pad = (n: number) => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };
    setForm((p) => ({ ...p, startTime: toLocal(now), endTime: toLocal(later) }));
  }, []);

  useEffect(() => {
    if (!form.companyId) { setContacts([]); return; }
    listContactsByCompany(form.companyId)
      .then((items) => {
        setContacts(items);
        if (items.length > 0) setForm((p) => ({ ...p, contactId: items[0].id }));
      })
      .catch(() => setContacts([]));
  }, [form.companyId]);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const submit = async () => {
    if (!userId) return showToast("Sesión expirada", "error");
    if (!form.companyId)  return showToast("Selecciona una empresa", "error");
    if (!form.contactId)  return showToast("Selecciona un contacto", "error");
    if (!form.title.trim()) return showToast("Ingresa un título", "error");
    if (new Date(form.endTime) <= new Date(form.startTime)) {
      return showToast("La hora de fin debe ser posterior a la de inicio", "error");
    }

    setSaving(true);
    try {
      await scheduleMeeting({
        companyId: form.companyId,
        contactId: form.contactId,
        userId,
        title: form.title,
        description: form.description || undefined,
        startTime: new Date(form.startTime).toISOString(),
        endTime: new Date(form.endTime).toISOString(),
        meetingLink: form.meetingLink || undefined,
      });
      showToast("Reunión agendada ✓");
      setForm((p) => ({ ...p, title: "", description: "", meetingLink: "" }));
      window.location.reload();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Error al agendar", "error");
    } finally {
      setSaving(false);
    }
  };

  const companyName = (id: string) => companies.find((c) => c.id === id)?.name ?? "—";

  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-950">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 rounded-xl px-4 py-3 text-sm font-medium shadow-lg ${
          toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
        }`}>
          {toast.msg}
        </div>
      )}

      <div className="border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-800 dark:bg-gray-900">
        <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">Calendario de reuniones</h1>
        <p className="text-sm text-gray-500 mt-0.5 dark:text-gray-400">
          {meetings.length} reunion{meetings.length === 1 ? "" : "es"} agendada{meetings.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="grid gap-4 p-6 xl:grid-cols-3">
        {/* Lista de reuniones */}
        <div className="xl:col-span-2">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Próximas reuniones</h2>
            </div>
            {loading && <div className="p-6"><Loader text="Cargando reuniones..." /></div>}
            {error && <div className="p-6"><EmptyState title="Error" description={error} /></div>}
            {!loading && !error && meetings.length === 0 && (
              <div className="py-12 text-center">
                <Calendar size={32} className="mx-auto text-gray-300 dark:text-gray-700 mb-3" />
                <p className="text-sm text-gray-500 font-medium dark:text-gray-400">Sin reuniones agendadas</p>
                <p className="text-xs text-gray-400 mt-1 dark:text-gray-500">Usa el formulario a la derecha para agendar una</p>
              </div>
            )}
            {!loading && !error && meetings.length > 0 && (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {meetings.map((m) => (
                  <div key={m.id} className="flex items-start gap-3 px-5 py-4 hover:bg-gray-50 transition-colors dark:hover:bg-gray-800/60">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900">
                      <Calendar size={17} className="text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{m.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 dark:text-gray-400">{companyName(m.companyId)}</p>
                      <div className="mt-1.5 flex items-center gap-3 text-[11px] text-gray-400 dark:text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {new Date(m.startTime).toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short" })}
                        </span>
                        {m.meetingLink && (
                          <a href={m.meetingLink} target="_blank" rel="noreferrer"
                            className="flex items-center gap-1 text-indigo-600 hover:underline dark:text-indigo-400">
                            <Video size={11} /> Link
                          </a>
                        )}
                      </div>
                    </div>
                    <span className={`shrink-0 text-[10px] font-semibold rounded-full px-2 py-0.5 ${
                      m.status === "SCHEDULED" ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" :
                      m.status === "COMPLETED" ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" :
                      "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                    }`}>
                      {m.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Formulario */}
        <aside className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm h-fit dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2 dark:text-gray-100">
            <Plus size={15} className="text-indigo-600 dark:text-indigo-400" /> Nueva reunión
          </h2>

          <div className="space-y-3">
            <Field label="Empresa *">
              <select value={form.companyId} onChange={(e) => setForm(p => ({ ...p, companyId: e.target.value }))}
                className={SELECT_CLS}>
                <option value="">Seleccionar empresa...</option>
                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>

            <Field label="Contacto *">
              <select value={form.contactId} onChange={(e) => setForm(p => ({ ...p, contactId: e.target.value }))}
                disabled={contacts.length === 0}
                className={`${SELECT_CLS} disabled:opacity-60 disabled:cursor-not-allowed`}>
                {contacts.length === 0 ? (
                  <option value="">Primero elige una empresa</option>
                ) : (
                  contacts.map(c => <option key={c.id} value={c.id}>{c.name} ({c.role})</option>)
                )}
              </select>
            </Field>

            <Field label="Título *">
              <input value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="ej: Demo Staff Augmentation" className={INPUT_CLS} />
            </Field>

            <Field label="Inicio *">
              <input type="datetime-local" value={form.startTime}
                onChange={(e) => {
                  const v = e.target.value;
                  setForm(p => ({ ...p, startTime: v, endTime: p.endTime < v ? v : p.endTime }));
                }}
                className={INPUT_CLS} />
            </Field>

            <Field label="Fin *">
              <input type="datetime-local" value={form.endTime} min={form.startTime}
                onChange={(e) => setForm(p => ({ ...p, endTime: e.target.value }))}
                className={INPUT_CLS} />
            </Field>

            <Field label="Descripción">
              <textarea rows={2} value={form.description}
                onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Agenda..."
                className={`${INPUT_CLS} resize-none`} />
            </Field>

            <Field label="Link de videollamada">
              <input type="url" value={form.meetingLink}
                onChange={(e) => setForm(p => ({ ...p, meetingLink: e.target.value }))}
                placeholder="https://meet.google.com/..."
                className={INPUT_CLS} />
            </Field>

            <button onClick={submit} disabled={saving}
              className="w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-60 transition-all shadow-sm hover:shadow-md">
              {saving ? "Agendando..." : "📅 Agendar reunión"}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide dark:text-gray-400">{label}</label>
      {children}
    </div>
  );
}
