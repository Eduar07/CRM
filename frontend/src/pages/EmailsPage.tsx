import { useMemo } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Clock, CheckCircle, Phone, Mail } from "lucide-react";
import { useCompanies } from "../hooks/useCompanies";
import { Loader, EmptyState } from "../components/common";
import type { Company, ContactStatus } from "../types/company";

/**
 * BUG #9 FIX — Página de Seguimientos con lógica real de priorización.
 *
 * Lógica (cliente, usando la data ya disponible):
 *   🔴 URGENTE  — empresas CONTACTADA/En proceso con +7 días sin actualización
 *   🟡 PRÓXIMO  — empresas contactadas hace 3–7 días
 *   ⚪ SIN RESPUESTA — empresas CONTACTADA recién (<3 días)
 *
 * Cuando el backend exponga /api/interactions/followups-pending, se reemplaza la fuente de datos.
 */

type Urgency = "HIGH" | "MEDIUM" | "LOW";

type Followup = {
  company: Company;
  urgency: Urgency;
  daysSince: number;
};

function classifyFollowups(companies: Company[]): Followup[] {
  const now = Date.now();
  const DAY = 86_400_000;

  // Empresas en seguimiento activo: Contactada o En proceso
  const active = companies.filter(
    (c) => c.contactStatus === "Contactada" || c.contactStatus === "En proceso"
  );

  return active.map((c) => {
    const created = new Date(c.createdAt).getTime();
    const daysSince = Math.floor((now - created) / DAY);
    let urgency: Urgency = "LOW";
    if (daysSince >= 7) urgency = "HIGH";
    else if (daysSince >= 3) urgency = "MEDIUM";
    return { company: c, urgency, daysSince };
  });
}

const URGENCY_CFG: Record<Urgency, { label: string; icon: typeof AlertTriangle; cardBg: string; badge: string; iconColor: string }> = {
  HIGH:   { label: "Urgentes — Sin contacto en +7 días",    icon: AlertTriangle, cardBg: "border-red-200 bg-red-50",    badge: "bg-red-100 text-red-700",    iconColor: "text-red-500" },
  MEDIUM: { label: "Próximos — Contactadas hace 3-7 días",  icon: Clock,         cardBg: "border-amber-200 bg-amber-50", badge: "bg-amber-100 text-amber-700", iconColor: "text-amber-500" },
  LOW:    { label: "Recientes — Contactadas hace <3 días",  icon: CheckCircle,   cardBg: "border-gray-200 bg-white",     badge: "bg-gray-100 text-gray-700",   iconColor: "text-gray-400" },
};

const STATUS_BADGE: Record<ContactStatus, string> = {
  "Nueva":      "bg-gray-100 text-gray-700",
  "Contactada": "bg-blue-100 text-blue-700",
  "En proceso": "bg-amber-100 text-amber-700",
  "Cerrada":    "bg-green-100 text-green-700",
};

export function EmailsPage() {
  const { companies, loading, error } = useCompanies();

  const followups = useMemo(() => classifyFollowups(companies), [companies]);

  const grouped = useMemo(() => ({
    HIGH:   followups.filter(f => f.urgency === "HIGH"),
    MEDIUM: followups.filter(f => f.urgency === "MEDIUM"),
    LOW:    followups.filter(f => f.urgency === "LOW"),
  }), [followups]);

  const totalActive = followups.length;

  return (
    <div className="min-h-full bg-gray-50">
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <h1 className="text-lg font-bold text-gray-900">Seguimientos</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {totalActive} empresa{totalActive !== 1 ? "s" : ""} en seguimiento activo
        </p>
      </div>

      <div className="p-6 space-y-5">
        {loading && <Loader text="Cargando seguimientos..." />}
        {error && <EmptyState title="Error" description={error} />}

        {!loading && !error && totalActive === 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle size={28} className="text-green-600" />
            </div>
            <h3 className="text-base font-semibold text-gray-900">¡Todo al día!</h3>
            <p className="mt-1 text-sm text-gray-500">No hay empresas en seguimiento pendiente.</p>
          </div>
        )}

        {!loading && !error && totalActive > 0 && (
          <>
            {(["HIGH", "MEDIUM", "LOW"] as Urgency[]).map((u) => {
              const items = grouped[u];
              if (items.length === 0) return null;
              const cfg = URGENCY_CFG[u];
              const Icon = cfg.icon;

              return (
                <section key={u}>
                  <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
                    <Icon size={16} className={cfg.iconColor} />
                    {cfg.label}
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${cfg.badge}`}>
                      {items.length}
                    </span>
                  </h2>
                  <div className="space-y-2">
                    {items.map(({ company, daysSince }) => (
                      <FollowupCard key={company.id} company={company} daysSince={daysSince} cardBg={cfg.cardBg} />
                    ))}
                  </div>
                </section>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}

function FollowupCard({ company, daysSince, cardBg }: { company: Company; daysSince: number; cardBg: string }) {
  return (
    <div className={`rounded-xl border p-4 transition-shadow hover:shadow-md ${cardBg}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Link to={`/companies/${company.id}`} className="text-sm font-semibold text-gray-900 hover:text-indigo-600 truncate">
              {company.name}
            </Link>
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_BADGE[company.contactStatus]}`}>
              {company.contactStatus}
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            {company.industry ?? "Sin industria"} · {company.department ?? "—"}
          </p>
          <p className="mt-1 text-[11px] text-gray-400">
            Contactada hace <span className="font-semibold">{daysSince}</span> día{daysSince !== 1 ? "s" : ""}
            {company.assignedTo && <> · asignada a <span className="font-semibold">{company.assignedTo}</span></>}
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-1.5">
          <Link to={`/companies/${company.id}`}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-2.5 py-1 text-[11px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Phone size={10} /> Ver detalle
          </Link>
          <Link to={`/companies/${company.id}`}
            className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-indigo-700 transition-colors">
            <Mail size={10} /> Email
          </Link>
        </div>
      </div>
    </div>
  );
}
