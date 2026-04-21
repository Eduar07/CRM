import { useEffect, useMemo, useState } from "react";
import { Search, UserPlus, Users, Mail, Phone } from "lucide-react";
import { EmptyState, Loader } from "../components/common";
import { Modal } from "../components/ui/Modal";
import { useCompanies } from "../hooks/useCompanies";
import { listContactsByCompany, createContact } from "../services/contact.service";
import type { Contact, ContactRole } from "../types/contact";

const ROLE_LABELS: Record<string, string> = {
  HR: "Recursos Humanos", TALENT_MANAGER: "Talent Manager",
  CTO: "CTO", CEO: "CEO",
};

const ROLE_CFG: Record<string, string> = {
  CEO: "bg-purple-100 text-purple-700",
  CTO: "bg-blue-100 text-blue-700",
  TALENT_MANAGER: "bg-amber-100 text-amber-700",
  HR: "bg-green-100 text-green-700",
};

const ROLES: ContactRole[] = ["CEO", "CTO", "TALENT_MANAGER", "HR"];

type Toast = { msg: string; type: "success" | "error" } | null;

export function ContactsPage() {
  const { companies, loading: loadingCompanies, error: companiesError } = useCompanies();
  const [companyId, setCompanyId] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [contactsError, setContactsError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "CEO" as ContactRole });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast>(null);

  useEffect(() => {
    if (!companyId && companies.length > 0) setCompanyId(companies[0].id);
  }, [companyId, companies]);

  const loadContacts = async (cid: string) => {
    setLoadingContacts(true); setContactsError(null);
    try {
      const items = await listContactsByCompany(cid);
      setContacts(items);
    } catch (e) {
      setContactsError(e instanceof Error ? e.message : "Error al cargar contactos");
      setContacts([]);
    } finally {
      setLoadingContacts(false);
    }
  };

  useEffect(() => {
    if (!companyId) { setContacts([]); return; }
    void loadContacts(companyId);
  }, [companyId]);

  const selectedCompany = useMemo(() => companies.find((c) => c.id === companyId), [companies, companyId]);

  // BUG #6 FIX: filtrado por búsqueda
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (ROLE_LABELS[c.role] ?? c.role).toLowerCase().includes(q)
    );
  }, [contacts, search]);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const submit = async () => {
    if (!companyId) return;
    if (!form.name.trim() || !form.email.trim()) {
      showToast("Nombre y email son obligatorios", "error"); return;
    }
    setSaving(true);
    try {
      await createContact({
        companyId, name: form.name, email: form.email, role: form.role,
      });
      showToast("Contacto creado ✓");
      setModalOpen(false);
      setForm({ name: "", email: "", role: "CEO" });
      await loadContacts(companyId);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Error al crear contacto", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-full bg-gray-50">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 rounded-xl px-4 py-3 text-sm font-medium shadow-lg ${
          toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
        }`}>
          {toast.msg}
        </div>
      )}

      {/* BUG #6 FIX: header alineado con flex y gap consistente */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center flex-wrap gap-3">
          <h1 className="text-lg font-bold text-gray-900">Contactos</h1>

          {/* Select de empresa */}
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Empresa:</label>
            <select value={companyId} onChange={(e) => setCompanyId(e.target.value)}
              disabled={loadingCompanies || companies.length === 0}
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-indigo-400 cursor-pointer min-w-[200px]">
              <option value="">Seleccionar...</option>
              {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* Buscador */}
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 max-w-xs focus-within:border-indigo-400 focus-within:bg-white transition-colors">
            <Search size={14} className="text-gray-400" />
            <input type="text" placeholder="Buscar contacto..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm placeholder-gray-400 outline-none" />
          </div>

          <button onClick={() => setModalOpen(true)} disabled={!companyId}
            className="ml-auto inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 hover:shadow-md active:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
            <UserPlus size={15} /> Nuevo contacto
          </button>
        </div>
      </div>

      <div className="p-6">
        {loadingCompanies && <Loader text="Cargando empresas..." />}
        {companiesError && <EmptyState title="Error" description={companiesError} />}

        {selectedCompany && (
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">{selectedCompany.name}</h2>
                <p className="text-xs text-gray-500">
                  {filtered.length === contacts.length
                    ? `${contacts.length} contacto${contacts.length !== 1 ? "s" : ""}`
                    : `${filtered.length} de ${contacts.length} contactos`}
                </p>
              </div>
            </div>

            {loadingContacts && <div className="p-6"><Loader text="Cargando contactos..." /></div>}
            {contactsError && <div className="p-6"><EmptyState title="Error" description={contactsError} /></div>}

            {!loadingContacts && !contactsError && filtered.length === 0 && (
              <div className="py-12 text-center">
                <Users size={32} className="mx-auto text-gray-300 mb-3" />
                <p className="text-sm font-medium text-gray-500">
                  {search ? `Sin resultados para "${search}"` : "Sin contactos registrados"}
                </p>
                {!search && (
                  <p className="text-xs text-gray-400 mt-1">Agrega el primer contacto para esta empresa</p>
                )}
              </div>
            )}

            {!loadingContacts && !contactsError && filtered.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead className="border-b border-gray-100 bg-gray-50">
                    <tr>
                      {["Nombre", "Email", "Rol", "Teléfono"].map(h => (
                        <th key={h} className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((c) => (
                      <tr key={c.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                              {c.name.slice(0, 1).toUpperCase()}
                            </div>
                            <span className="text-sm font-semibold text-gray-900">{c.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <a href={`mailto:${c.email}`} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600">
                            <Mail size={12} /> {c.email}
                          </a>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${ROLE_CFG[c.role] ?? "bg-gray-100 text-gray-700"}`}>
                            {ROLE_LABELS[c.role] ?? c.role}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-sm text-gray-400">
                          <span className="inline-flex items-center gap-1"><Phone size={12} /> —</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {!selectedCompany && !loadingCompanies && (
          <EmptyState title="Sin empresa seleccionada" description="Selecciona una empresa para ver sus contactos." />
        )}
      </div>

      {/* Modal Nuevo contacto */}
      <Modal open={modalOpen} title="Nuevo contacto" onClose={() => setModalOpen(false)}>
        <div className="space-y-3">
          <Field label="Nombre completo *">
            <input value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="ej: Carlos Ramírez"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400" />
          </Field>
          <Field label="Email *">
            <input type="email" value={form.email} onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
              placeholder="contacto@empresa.com"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400" />
          </Field>
          <Field label="Rol *">
            <select value={form.role} onChange={(e) => setForm(p => ({ ...p, role: e.target.value as ContactRole }))}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 cursor-pointer">
              {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
            </select>
          </Field>
          <div className="flex gap-2 pt-2">
            <button onClick={() => setModalOpen(false)} disabled={saving}
              className="flex-1 rounded-xl border border-gray-300 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button onClick={submit} disabled={saving}
              className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 transition-all shadow-sm hover:shadow-md">
              {saving ? "Guardando..." : "Crear contacto"}
            </button>
          </div>
        </div>
      </Modal>
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
