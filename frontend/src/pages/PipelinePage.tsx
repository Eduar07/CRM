import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useCompanies } from "../hooks/useCompanies";
import { Loader, EmptyState } from "../components/common";
import { updateCompany } from "../services/company.service";
import type { ContactStatus, Company } from "../types/company";

const STAGES: ContactStatus[] = ["Nueva", "Contactada", "En proceso", "Cerrada"];

const STAGE_CFG: Record<ContactStatus, { header: string; dot: string; ring: string }> = {
  "Nueva":      { header: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",   dot: "bg-gray-400",   ring: "ring-gray-300 dark:ring-gray-600" },
  "Contactada": { header: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",   dot: "bg-blue-500",   ring: "ring-blue-400 dark:ring-blue-600" },
  "En proceso": { header: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300", dot: "bg-amber-400",  ring: "ring-amber-400 dark:ring-amber-600" },
  "Cerrada":    { header: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300", dot: "bg-green-500",  ring: "ring-green-400 dark:ring-green-600" },
};

type CardProps = {
  company: Company;
  onDragStart: (id: string, current: ContactStatus) => void;
  onDragEnd: () => void;
  isDragging: boolean;
};

function CompanyCard({ company, onDragStart, onDragEnd, isDragging }: CardProps) {
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", company.id);
        onDragStart(company.id, company.contactStatus as ContactStatus);
      }}
      onDragEnd={onDragEnd}
      className={`rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition-all cursor-grab active:cursor-grabbing dark:border-gray-700 dark:bg-gray-900 ${
        isDragging ? "opacity-40 scale-95" : "hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600"
      }`}
    >
      <Link to={`/companies/${company.id}`} onClick={(e) => e.stopPropagation()}>
        <p className="text-sm font-semibold text-gray-900 truncate hover:text-indigo-600 dark:text-gray-100 dark:hover:text-indigo-400">{company.name}</p>
      </Link>
      {company.industry && <p className="text-xs text-gray-500 mt-0.5 dark:text-gray-400">{company.industry}</p>}
      {company.assignedTo && (
        <div className="mt-2 flex items-center gap-1.5">
          <div className="h-5 w-5 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
            {company.assignedTo.slice(0, 1).toUpperCase()}
          </div>
          <span className="text-[11px] text-gray-500 dark:text-gray-400">{company.assignedTo}</span>
        </div>
      )}
    </div>
  );
}

export function PipelinePage() {
  const { companies, loading, error, refresh } = useCompanies();

  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [draggedFrom, setDraggedFrom] = useState<ContactStatus | null>(null);
  const [hoverStage, setHoverStage] = useState<ContactStatus | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const [optimistic, setOptimistic] = useState<Record<string, ContactStatus>>({});

  const byStage = useMemo(() => {
    const map: Record<ContactStatus, Company[]> = { "Nueva": [], "Contactada": [], "En proceso": [], "Cerrada": [] };
    companies.forEach((c) => {
      const stage = (optimistic[c.id] ?? c.contactStatus) as ContactStatus;
      if (map[stage]) map[stage].push({ ...c, contactStatus: stage });
    });
    return map;
  }, [companies, optimistic]);

  const handleDragStart = (id: string, from: ContactStatus) => {
    setDraggedId(id);
    setDraggedFrom(from);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDraggedFrom(null);
    setHoverStage(null);
  };

  const handleDrop = async (targetStage: ContactStatus) => {
    if (!draggedId || !draggedFrom || draggedFrom === targetStage) {
      handleDragEnd();
      return;
    }

    setOptimistic((prev) => ({ ...prev, [draggedId]: targetStage }));

    const movedId = draggedId;
    const fromStage = draggedFrom;
    handleDragEnd();
    setSaving(true);

    try {
      await updateCompany(movedId, { contactStatus: targetStage });
      setToast({ msg: `Empresa movida a "${targetStage}" ✓`, type: "success" });
      await refresh();
      setOptimistic((prev) => {
        const next = { ...prev };
        delete next[movedId];
        return next;
      });
    } catch (err) {
      setOptimistic((prev) => {
        const next = { ...prev };
        delete next[movedId];
        return next;
      });
      setToast({
        msg: err instanceof Error ? `Error: ${err.message}` : "No se pudo actualizar el estado",
        type: "error",
      });
      void refresh();
      void fromStage;
    } finally {
      setSaving(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-950">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 rounded-xl px-4 py-3 text-sm font-medium shadow-lg ${
          toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
        }`}>
          {toast.msg}
        </div>
      )}

      <div className="border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">Pipeline</h1>
            <p className="text-sm text-gray-500 mt-0.5 dark:text-gray-400">
              {companies.length} empresas · Arrastra una tarjeta para cambiarla de estado
            </p>
          </div>
          {saving && <span className="text-xs text-gray-400 animate-pulse dark:text-gray-500">Guardando...</span>}
        </div>
      </div>

      <div className="p-6">
        {loading && <Loader text="Cargando pipeline..." />}
        {error && <EmptyState title="Error" description={error} />}
        {!loading && !error && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {STAGES.map((stage) => {
              const cfg = STAGE_CFG[stage];
              const items = byStage[stage];
              const isHover = hoverStage === stage && draggedId !== null;

              return (
                <div
                  key={stage}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                    if (hoverStage !== stage) setHoverStage(stage);
                  }}
                  onDragLeave={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                      setHoverStage(null);
                    }
                  }}
                  onDrop={() => handleDrop(stage)}
                  className={`flex flex-col gap-3 rounded-xl p-2 transition-all ${
                    isHover ? `bg-indigo-50 ring-2 ${cfg.ring} dark:bg-indigo-950` : ""
                  }`}
                >
                  <div className={`flex items-center justify-between rounded-xl px-3 py-2 ${cfg.header}`}>
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
                      <span className="text-xs font-semibold">{stage}</span>
                    </div>
                    <span className="text-xs font-bold">{items.length}</span>
                  </div>

                  <div className="space-y-2 min-h-[80px]">
                    {items.length === 0 ? (
                      <p className="text-center text-xs text-gray-400 py-6 italic dark:text-gray-500">
                        {isHover ? "Soltar aquí" : "Sin empresas"}
                      </p>
                    ) : (
                      items.map((c) => (
                        <CompanyCard
                          key={c.id}
                          company={c}
                          onDragStart={handleDragStart}
                          onDragEnd={handleDragEnd}
                          isDragging={draggedId === c.id}
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
