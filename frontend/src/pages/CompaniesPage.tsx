import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Filter } from "lucide-react";
import { useCompanies } from "../hooks/useCompanies";
import { createCompany } from "../services/company.service";
import { Loader, EmptyState } from "../components/common";
import { Modal } from "../components/ui/Modal";
import type { CreateCompanyRequest, ContactStatus } from "../types/company";

const STATUS_OPTIONS: ContactStatus[] = ["Nueva", "Contactada", "En proceso", "Cerrada"];

const STATUS_CFG: Record<ContactStatus, string> = {
  "Nueva":      "bg-gray-100 text-gray-700",
  "Contactada": "bg-blue-100 text-blue-700",
  "En proceso": "bg-amber-100 text-amber-700",
  "Cerrada":    "bg-green-100 text-green-700",
};

function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_CFG[status as ContactStatus] ?? "bg-gray-100 text-gray-600";
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${cls}`}>{status}</span>;
}

const EMPTY_FORM: CreateCompanyRequest = {
  name: "", linkedinUrl: "", country: "Colombia",
  department: "", industry: "", size: "", website: "", assignedTo: ""
};

export function CompaniesPage() {
  const { companies, loading, error, refresh } = useCompanies();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [assignedFilter, setAssignedFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<CreateCompanyRequest>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const filtered = useMemo(() => {
    return companies.filter((c) => {
      const q = query.trim().toLowerCase();
      const matchQ = !q || c.name.toLowerCase().includes(q) || (c.industry ?? "").toLowerCase().includes(q) || (c.department ?? "").toLowerCase().includes(q);
      const matchStatus = !statusFilter || c.contactStatus === statusFilter;
      const matchAssigned = !assignedFilter || (c.assignedTo ?? "").toLowerCase().includes(assignedFilter.toLowerCase());
      return matchQ && matchStatus && matchAssigned;
    });
  }, [companies, query, statusFilter, assignedFilter]);

  const handleCreate = async () => {
    if (!form.name || !form.linkedinUrl) { setSaveError("Nombre y LinkedIn son obligatorios"); return; }
    setSaving(true); setSaveError("");
    try {
      await createCompany(form);
      setShowModal(false);
      setForm(EMPTY_FORM);
      await refresh();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-full bg-gray-50">
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-gray-900">Empresas</h1>
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 max-w-xs">
            <Search size={14} className="text-gray-400" />
            <input type="text" placeholder="Buscar..." value={query} onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm placeholder-gray-400 outline-none" />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-gray-400" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-600 outline-none">
              <option value="">Todos los estados</option>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input type="text" placeholder="Asignada a..." value={assignedFilter}
              onChange={(e) => setAssignedFilter(e.target.value)}
              className="rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-600 outline-none w-32" />
          </div>
          <button onClick={() => setShowModal(true)}
            className="ml-auto flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 transition-colors">
            <Plus size={15} /> Nueva empresa
          </button>
        </div>
      </div>

      <div className="p-6">
        {loading && <Loader text="Cargando empresas..." />}
        {error && <EmptyState title="Error" description={error} />}
        {!loading && !error && (
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="border-b border-gray-100">
                <tr>
                  {["Empresa","Industria","Departamento","Estado","Asignada","Website","Acciones"].map(h => (
                    <th key={h} className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="px-5 py-10 text-center text-sm text-gray-400">No hay empresas que coincidan con los filtros</td></tr>
                ) : filtered.map((c) => (
                  <tr key={c.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-sm font-semibold text-gray-900">
                      <Link to={`/companies/${c.id}`} className="hover:text-blue-600">{c.name}</Link>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-500">{c.industry ?? "—"}</td>
                    <td className="px-5 py-3 text-sm text-gray-500">{c.department ?? "—"}</td>
                    <td className="px-5 py-3"><StatusBadge status={c.contactStatus} /></td>
                    <td className="px-5 py-3 text-sm text-gray-500">{c.assignedTo ?? "—"}</td>
                    <td className="px-5 py-3 text-sm text-gray-400 truncate max-w-[120px]">
                      {c.website ? <a href={c.website} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline truncate">{c.website}</a> : "—"}
                    </td>
                    <td className="px-5 py-3">
                      <Link to={`/companies/${c.id}`} className="text-xs text-blue-600 hover:underline">Ver detalle</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={showModal} title="Nueva empresa" onClose={() => { setShowModal(false); setForm(EMPTY_FORM); setSaveError(""); }}>
        <div className="space-y-3">
          {(["name","linkedinUrl","country","department","industry","size","website","assignedTo"] as const).map((field) => (
            <div key={field}>
              <label className="block text-xs font-medium text-gray-600 mb-1 capitalize">{field === "linkedinUrl" ? "LinkedIn URL" : field === "assignedTo" ? "Asignada a" : field}</label>
              <input value={form[field] ?? ""} onChange={(e) => setForm(p => ({ ...p, [field]: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400" />
            </div>
          ))}
          {saveError && <p className="text-xs text-red-600 bg-red-50 rounded-xl px-3 py-2">{saveError}</p>}
          <button onClick={handleCreate} disabled={saving}
            className="w-full rounded-xl bg-gray-900 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60 transition-colors">
            {saving ? "Guardando..." : "Crear empresa"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
