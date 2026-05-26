import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Filter } from "lucide-react";
import { useCompanies } from "../hooks/useCompanies";
import { createCompany } from "../services/company.service";
import { Loader, EmptyState } from "../components/common";
import { Modal } from "../components/ui/Modal";
import type { CreateCompanyRequest, ContactStatus } from "../types/company";

const STATUS_OPTIONS: ContactStatus[] = ["Nueva", "Contactada", "En proceso", "Cerrada"];

const VENDEDORES = [
  { value: "marcela",  label: "Marcela — Santander" },
  { value: "karolain", label: "Karolain — Norte de Santander" },
];

const DEPARTAMENTOS = ["Santander", "Norte de Santander", "Cundinamarca", "Antioquia", "Valle del Cauca", "Atlántico"];

const INDUSTRIAS = ["Tecnología", "Servicios Financieros", "Salud", "Educación", "Manufactura", "Comercio", "Construcción", "Agroindustria", "Logística", "Otro"];

const SIZES = ["1-50", "51-200", "201-1000", "1000+"];

const STATUS_CFG: Record<ContactStatus, string> = {
  "Nueva":      "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  "Contactada": "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  "En proceso": "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  "Cerrada":    "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
};

function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_CFG[status as ContactStatus] ?? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${cls}`}>{status}</span>;
}

const EMPTY_FORM: CreateCompanyRequest = {
  name: "", linkedinUrl: "", country: "Colombia",
  department: "", industry: "", size: "", website: "", assignedTo: ""
};

const INPUT_CLS = "w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-indigo-900";
const SELECT_CLS = "w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 cursor-pointer dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100";

export function CompaniesPage() {
  const { companies, loading, error, refresh } = useCompanies();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [assignedFilter, setAssignedFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<CreateCompanyRequest>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const filtered = useMemo(() => {
    return companies.filter((c) => {
      const q = query.trim().toLowerCase();
      const matchQ = !q || c.name.toLowerCase().includes(q) || (c.industry ?? "").toLowerCase().includes(q) || (c.department ?? "").toLowerCase().includes(q);
      const matchStatus = !statusFilter || c.contactStatus === statusFilter;
      const matchAssigned = !assignedFilter || (c.assignedTo ?? "").toLowerCase() === assignedFilter.toLowerCase();
      return matchQ && matchStatus && matchAssigned;
    });
  }, [companies, query, statusFilter, assignedFilter]);

  const handleCreate = async () => {
    if (!form.name?.trim() || !form.linkedinUrl?.trim()) {
      setSaveError("Nombre y LinkedIn URL son obligatorios");
      return;
    }
    setSaving(true); setSaveError("");
    try {
      await createCompany(form);
      setShowModal(false);
      setForm(EMPTY_FORM);
      setToast({ msg: "Empresa creada correctamente ✓", type: "success" });
      setTimeout(() => setToast(null), 3000);
      await refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al guardar";
      setSaveError(msg);
    } finally {
      setSaving(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setForm(EMPTY_FORM);
    setSaveError("");
  };

  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-950">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 rounded-xl px-4 py-3 text-sm font-medium shadow-lg animate-in slide-in-from-top-2 ${
          toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
        }`}>
          {toast.msg}
        </div>
      )}

      <div className="border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">Empresas</h1>

          <div className="flex flex-1 items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 max-w-xs focus-within:border-indigo-400 focus-within:bg-white transition-colors dark:border-gray-700 dark:bg-gray-800 dark:focus-within:bg-gray-800">
            <Search size={14} className="text-gray-400" />
            <input type="text" placeholder="Buscar..." value={query} onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm placeholder-gray-400 outline-none dark:text-gray-200 dark:placeholder-gray-500" />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={14} className="text-gray-400" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-600 outline-none focus:border-indigo-400 cursor-pointer dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300">
              <option value="">Todos los estados</option>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={assignedFilter} onChange={(e) => setAssignedFilter(e.target.value)}
              className="rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-600 outline-none focus:border-indigo-400 cursor-pointer dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300">
              <option value="">Todos los vendedores</option>
              {VENDEDORES.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}
            </select>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="ml-auto inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 hover:shadow-md active:bg-indigo-800 transition-all cursor-pointer"
          >
            <Plus size={15} /> Nueva empresa
          </button>
        </div>
      </div>

      <div className="p-6">
        {loading && <Loader text="Cargando empresas..." />}
        {error && <EmptyState title="Error" description={error} />}
        {!loading && !error && (
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-x-auto dark:border-gray-800 dark:bg-gray-900">
            <table className="min-w-full text-left">
              <thead className="border-b border-gray-100 dark:border-gray-800">
                <tr>
                  {["Empresa","Industria","Departamento","Estado","Asignada","Website","Acciones"].map(h => (
                    <th key={h} className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="px-5 py-10 text-center text-sm text-gray-400 dark:text-gray-500">No hay empresas que coincidan con los filtros</td></tr>
                ) : filtered.map((c) => (
                  <tr key={c.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors dark:border-gray-800 dark:hover:bg-gray-800/60">
                    <td className="px-5 py-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
                      <Link to={`/companies/${c.id}`} className="hover:text-indigo-600 dark:hover:text-indigo-400">{c.name}</Link>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-500 dark:text-gray-400">{c.industry ?? "—"}</td>
                    <td className="px-5 py-3 text-sm text-gray-500 dark:text-gray-400">{c.department ?? "—"}</td>
                    <td className="px-5 py-3"><StatusBadge status={c.contactStatus} /></td>
                    <td className="px-5 py-3 text-sm text-gray-500 dark:text-gray-400">{c.assignedTo ?? "—"}</td>
                    <td className="px-5 py-3 text-sm text-gray-400 truncate max-w-[140px]">
                      {c.website ? <a href={c.website} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline truncate dark:text-indigo-400">{c.website}</a> : "—"}
                    </td>
                    <td className="px-5 py-3">
                      <Link to={`/companies/${c.id}`} className="text-xs text-indigo-600 hover:underline font-medium dark:text-indigo-400">Ver detalle →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── MODAL: Nueva empresa ── */}
      <Modal open={showModal} title="Nueva empresa" onClose={closeModal}>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide dark:text-gray-400">Nombre *</label>
            <input value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="ej: TechSolutions SAS" className={INPUT_CLS} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide dark:text-gray-400">LinkedIn URL *</label>
            <input value={form.linkedinUrl} onChange={(e) => setForm(p => ({ ...p, linkedinUrl: e.target.value }))}
              placeholder="https://linkedin.com/company/..." className={INPUT_CLS} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide dark:text-gray-400">Industria</label>
            <select value={form.industry ?? ""} onChange={(e) => setForm(p => ({ ...p, industry: e.target.value }))}
              className={SELECT_CLS}>
              <option value="">Seleccionar...</option>
              {INDUSTRIAS.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide dark:text-gray-400">Tamaño</label>
            <select value={form.size ?? ""} onChange={(e) => setForm(p => ({ ...p, size: e.target.value }))}
              className={SELECT_CLS}>
              <option value="">Seleccionar...</option>
              {SIZES.map(s => <option key={s} value={s}>{s} empleados</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide dark:text-gray-400">Departamento</label>
            <select value={form.department ?? ""} onChange={(e) => setForm(p => ({ ...p, department: e.target.value }))}
              className={SELECT_CLS}>
              <option value="">Seleccionar...</option>
              {DEPARTAMENTOS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide dark:text-gray-400">Website</label>
            <input value={form.website ?? ""} onChange={(e) => setForm(p => ({ ...p, website: e.target.value }))}
              placeholder="https://..." className={INPUT_CLS} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide dark:text-gray-400">Asignada a</label>
            <select value={form.assignedTo ?? ""} onChange={(e) => setForm(p => ({ ...p, assignedTo: e.target.value }))}
              className={SELECT_CLS}>
              <option value="">-- Seleccionar vendedor --</option>
              {VENDEDORES.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}
            </select>
            <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500">Se asignará automáticamente según el departamento</p>
          </div>

          {saveError && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2 dark:bg-red-950 dark:border-red-900 dark:text-red-400">
              {saveError}
            </p>
          )}

          <div className="flex gap-2 pt-2">
            <button onClick={closeModal}
              className="flex-1 rounded-xl border border-gray-300 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800">
              Cancelar
            </button>
            <button onClick={handleCreate} disabled={saving}
              className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-60 transition-all shadow-sm hover:shadow-md">
              {saving ? "Guardando..." : "Crear empresa"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
