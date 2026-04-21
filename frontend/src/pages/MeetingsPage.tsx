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

  // Inicializar fechas al montar
  useEffect(() => {
    const now = new Date();
    const later = new Date(now.getTime() + 60 * 60 * 1000);
    const toLocal = (d: Date) => {
      const pad = (n: number) => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };
    setForm((p) => ({ ...p, startTime: toLocal(now), endTime: toLocal(later) }));
  }, []);

  // Cargar contactos cuando cambia la empresa
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
      window.location.reload(); // recargar para actualizar la lista
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Error al agendar", "error");
    } finally {
      setSaving(false);
    }
  };

  const companyName = (id: string) => companies.find((c) => c.id === id)?.name ?? "—";

  return (
    <div className="min-h-full bg-gray-50">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 rounded-xl px-4 py-3 text-sm font-medium shadow-lg ${
          toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
        }`}>
          {toast.msg}
        </div>
      )}

      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <h1 className="text-lg font-bold text-gray-900">Calendario de reuniones</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {meetings.length} reunion{meetings.length === 1 ? "" : "es"} agendada{meetings.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="grid gap-4 p-6 xl:grid-cols-3">
        {/* Lista de reuniones */}
        <div className="xl:col-span-2">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">Próximas reuniones</h2>
            </div>
            {loading && <div className="p-6"><Loader text="Cargando reuniones..." /></div>}
            {error && <div className="p-6"><EmptyState title="Error" description={error} /></div>}
            {!loading && !error && meetings.length === 0 && (
              <div className="py-12 text-center">
                <Calendar size={32} className="mx-auto text-gray-300 mb-3" />
                <p className="text-sm text-gray-500 font-medium">Sin reuniones agendadas</p>
                <p className="text-xs text-gray-400 mt-1">Usa el formulario a la derecha para agendar una</p>
              </div>
            )}
            {!loading && !error && meetings.length > 0 && (
              <div className="divide-y divide-gray-100">
                {meetings.map((m) => (
                  <div key={m.id} className="flex items-start gap-3 px-5 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100">
                      <Calendar size={17} className="text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{m.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{companyName(m.companyId)}</p>
                      <div className="mt-1.5 flex items-center gap-3 text-[11px] text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {new Date(m.startTime).toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short" })}
                        </span>
                        {m.meetingLink && (
                          <a href={m.meetingLink} target="_blank" rel="noreferrer"
                            className="flex items-center gap-1 text-indigo-600 hover:underline">
                            <Video size={11} /> Link
                          </a>
                        )}
                      </div>
                    </div>
                    <span className={`shrink-0 text-[10px] font-semibold rounded-full px-2 py-0.5 ${
                      m.status === "SCHEDULED" ? "bg-blue-100 text-blue-700" :
                      m.status === "COMPLETED" ? "bg-green-100 text-green-700" :
                      "bg-red-100 text-red-700"
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
        <aside className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm h-fit">
          <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Plus size={15} className="text-indigo-600" /> Nueva reunión
          </h2>

          <div className="space-y-3">
            <Field label="Empresa *">
              <select value={form.companyId} onChange={(e) => setForm(p => ({ ...p, companyId: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 cursor-pointer">
                <option value="">Seleccionar empresa...</option>
                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>

            <Field label="Contacto *">
              <select value={form.contactId} onChange={(e) => setForm(p => ({ ...p, contactId: e.target.value }))}
                disabled={contacts.length === 0}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 cursor-pointer disabled:bg-gray-50 disabled:cursor-not-allowed">
                {contacts.length === 0 ? (
                  <option value="">Primero elige una empresa</option>
                ) : (
                  contacts.map(c => <option key={c.id} value={c.id}>{c.name} ({c.role})</option>)
                )}
              </select>
            </Field>

            <Field label="Título *">
              <input value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="ej: Demo Staff Augmentation"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400" />
            </Field>

            {/* BUG #8 FIX: datetime-local nativo con validación */}
            <Field label="Inicio *">
              <input type="datetime-local" value={form.startTime}
                onChange={(e) => {
                  const v = e.target.value;
                  setForm(p => ({ ...p, startTime: v, endTime: p.endTime < v ? v : p.endTime }));
                }}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400" />
            </Field>

            <Field label="Fin *">
              <input type="datetime-local" value={form.endTime} min={form.startTime}
                onChange={(e) => setForm(p => ({ ...p, endTime: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400" />
            </Field>

            <Field label="Descripción">
              <textarea rows={2} value={form.description}
                onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Agenda..."
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 resize-none" />
            </Field>

            <Field label="Link de videollamada">
              <input type="url" value={form.meetingLink}
                onChange={(e) => setForm(p => ({ ...p, meetingLink: e.target.value }))}
                placeholder="https://meet.google.com/..."
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400" />
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
      <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}
