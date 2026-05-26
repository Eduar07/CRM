import { useMemo } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Clock, CheckCircle, Phone, Mail } from "lucide-react";
import { useCompanies } from "../hooks/useCompanies";
import { Loader, EmptyState } from "../components/common";
import type { Company, ContactStatus } from "../types/company";

type Urgency = "HIGH" | "MEDIUM" | "LOW";

type Followup = {
  company: Company;
  urgency: Urgency;
  daysSince: number;
};

function classifyFollowups(companies: Company[]): Followup[] {
  const now = Date.now();
  const DAY = 86_400_000;

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
  HIGH:   { label: "Urgentes — Sin contacto en +7 días",    icon: AlertTriangle, cardBg: "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/40",    badge: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",    iconColor: "text-red-500 dark:text-red-400" },
  MEDIUM: { label: "Próximos — Contactadas hace 3-7 días",  icon: Clock,         cardBg: "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40", badge: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300", iconColor: "text-amber-500 dark:text-amber-400" },
  LOW:    { label: "Recientes — Contactadas hace <3 días",  icon: CheckCircle,   cardBg: "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900",     badge: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",   iconColor: "text-gray-400 dark:text-gray-500" },
};

const STATUS_BADGE: Record<ContactStatus, string> = {
  "Nueva":      "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  "Contactada": "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  "En proceso": "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  "Cerrada":    "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
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
    <div className="min-h-full bg-gray-50 dark:bg-gray-950">
      <div className="border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-800 dark:bg-gray-900">
        <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">Seguimientos</h1>
        <p className="text-sm text-gray-500 mt-0.5 dark:text-gray-400">
          {totalActive} empresa{totalActive !== 1 ? "s" : ""} en seguimiento activo
        </p>
      </div>

      <div className="p-6 space-y-5">
        {loading && <Loader text="Cargando seguimientos..." />}
        {error && <EmptyState title="Error" description={error} />}

        {!loading && !error && totalActive === 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <CheckCircle size={28} className="text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">¡Todo al día!</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">No hay empresas en seguimiento pendiente.</p>
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
                  <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
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
            <Link to={`/companies/${company.id}`} className="text-sm font-semibold text-gray-900 hover:text-indigo-600 truncate dark:text-gray-100 dark:hover:text-indigo-400">
              {company.name}
            </Link>
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_BADGE[company.contactStatus]}`}>
              {company.contactStatus}
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {company.industry ?? "Sin industria"} · {company.department ?? "—"}
          </p>
          <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500">
            Contactada hace <span className="font-semibold">{daysSince}</span> día{daysSince !== 1 ? "s" : ""}
            {company.assignedTo && <> · asignada a <span className="font-semibold">{company.assignedTo}</span></>}
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-1.5">
          <Link to={`/companies/${company.id}`}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-2.5 py-1 text-[11px] font-medium text-gray-700 hover:bg-gray-50 transition-colors dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
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
