import { useMemo } from "react";
import { Download, TrendingUp, Users, Mail, Calendar as CalIcon } from "lucide-react";
import { useCompanies } from "../hooks/useCompanies";
import { useDashboardKpis } from "../hooks/useDashboardKpis";
import { Loader, EmptyState } from "../components/common";
import type { Company, ContactStatus } from "../types/company";

/**
 * BUG #10 FIX — Página de Reportes funcional.
 * KPIs reales desde /api/dashboard/kpis + distribución de pipeline + export CSV.
 * Gráfico de barras hecho con SVG puro (sin dependencias nuevas).
 */

const STAGES: ContactStatus[] = ["Nueva", "Contactada", "En proceso", "Cerrada"];

const STAGE_COLORS: Record<ContactStatus, string> = {
  "Nueva":      "#9ca3af",
  "Contactada": "#3b82f6",
  "En proceso": "#f59e0b",
  "Cerrada":    "#10b981",
};

export function ReportsPage() {
  const { companies, loading, error } = useCompanies();
  const { kpis } = useDashboardKpis();

  const pipelineStats = useMemo(() => {
    const counts: Record<ContactStatus, number> = { "Nueva": 0, "Contactada": 0, "En proceso": 0, "Cerrada": 0 };
    companies.forEach((c) => {
      const st = c.contactStatus as ContactStatus;
      if (counts[st] !== undefined) counts[st]++;
    });
    return counts;
  }, [companies]);

  const total = companies.length || 1;
  const maxCount = Math.max(1, ...Object.values(pipelineStats));

  // Top 5 empresas por vendedor más activo
  const assignedStats = useMemo(() => {
    const map = new Map<string, number>();
    companies.forEach((c) => {
      const key = c.assignedTo ?? "Sin asignar";
      map.set(key, (map.get(key) ?? 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [companies]);

  const exportCSV = () => {
    const rows: string[][] = [
      ["Empresa", "Industria", "Tamaño", "Departamento", "Estado", "Asignada", "LinkedIn", "Website", "Creada"],
      ...companies.map((c) => [
        c.name,
        c.industry ?? "",
        c.size ?? "",
        c.department ?? "",
        c.contactStatus,
        c.assignedTo ?? "",
        c.linkedinUrl,
        c.website ?? "",
        new Date(c.createdAt).toLocaleDateString("es-CO"),
      ]),
    ];
    const csv = rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `reporte-campusland-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-full bg-gray-50">
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Reportes</h1>
            <p className="text-sm text-gray-500 mt-0.5">Métricas de prospección y pipeline</p>
          </div>
          <button onClick={exportCSV} disabled={companies.length === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all">
            <Download size={15} /> Exportar CSV
          </button>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {loading && <Loader text="Cargando reportes..." />}
        {error && <EmptyState title="Error" description={error} />}

        {!loading && !error && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
              <KpiCard icon={<Users size={16} />} label="Total empresas" value={kpis?.totalCompanies ?? companies.length} tint="indigo" />
              <KpiCard icon={<Mail size={16} />} label="Contactadas esta semana" value={kpis?.companiesThisWeek ?? 0} tint="blue" />
              <KpiCard icon={<CalIcon size={16} />} label="En proceso" value={kpis?.inProcess ?? pipelineStats["En proceso"]} tint="amber" />
              <KpiCard icon={<TrendingUp size={16} />} label="Tasa de contacto" value={`${kpis?.contactRate ?? 0}%`} tint="emerald" />
            </div>

            {/* Distribución de pipeline */}
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-gray-900 mb-4">Distribución por estado</h2>
                <div className="space-y-3">
                  {STAGES.map((stage) => {
                    const count = pipelineStats[stage];
                    const pct = Math.round((count / total) * 100);
                    return (
                      <div key={stage}>
                        <div className="mb-1 flex items-center justify-between text-xs">
                          <span className="flex items-center gap-2 font-medium text-gray-700">
                            <span className="h-2 w-2 rounded-full" style={{ background: STAGE_COLORS[stage] }} />
                            {stage}
                          </span>
                          <span className="text-gray-500">{count} · {pct}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%`, background: STAGE_COLORS[stage] }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Barras por estado */}
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-gray-900 mb-4">Empresas por estado</h2>
                <div className="flex h-48 items-end justify-around gap-3 pt-4">
                  {STAGES.map((stage) => {
                    const count = pipelineStats[stage];
                    const height = (count / maxCount) * 100;
                    return (
                      <div key={stage} className="flex flex-1 flex-col items-center gap-2">
                        <span className="text-xs font-bold text-gray-700">{count}</span>
                        <div className="w-full rounded-t-lg transition-all duration-500"
                          style={{ height: `${Math.max(height, 3)}%`, background: STAGE_COLORS[stage] }} />
                        <span className="text-[10px] text-gray-500 text-center">{stage}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Ranking vendedores */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-900">Ranking por vendedora</h2>
              </div>
              {assignedStats.length === 0 ? (
                <div className="py-10 text-center text-sm text-gray-400">Sin datos</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {assignedStats.map(([name, count], idx) => (
                    <div key={name} className="flex items-center gap-3 px-5 py-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                        #{idx + 1}
                      </div>
                      <span className="flex-1 text-sm font-semibold text-gray-900">{name}</span>
                      <span className="text-sm text-gray-500">{count} empresa{count !== 1 ? "s" : ""}</span>
                      <div className="w-32 h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div className="h-full rounded-full bg-indigo-500 transition-all"
                          style={{ width: `${(count / total) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tabla completa */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-x-auto">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-900">Todas las empresas ({companies.length})</h2>
              </div>
              <table className="min-w-full text-left">
                <thead className="border-b border-gray-100 bg-gray-50">
                  <tr>
                    {["Empresa", "Industria", "Estado", "Asignada", "Creada"].map(h => (
                      <th key={h} className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {companies.slice(0, 10).map((c: Company) => (
                    <tr key={c.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 text-sm font-semibold text-gray-900">{c.name}</td>
                      <td className="px-5 py-3 text-sm text-gray-500">{c.industry ?? "—"}</td>
                      <td className="px-5 py-3">
                        <span className="inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold"
                          style={{ background: `${STAGE_COLORS[c.contactStatus]}22`, color: STAGE_COLORS[c.contactStatus] }}>
                          {c.contactStatus}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-500">{c.assignedTo ?? "—"}</td>
                      <td className="px-5 py-3 text-sm text-gray-400">{new Date(c.createdAt).toLocaleDateString("es-CO")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {companies.length > 10 && (
                <div className="px-5 py-3 text-center border-t border-gray-100">
                  <p className="text-xs text-gray-400">Mostrando 10 de {companies.length} · Usa "Exportar CSV" para ver todas</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const TINTS: Record<string, string> = {
  indigo: "bg-indigo-100 text-indigo-600",
  blue: "bg-blue-100 text-blue-600",
  amber: "bg-amber-100 text-amber-600",
  emerald: "bg-emerald-100 text-emerald-600",
};

function KpiCard({ icon, label, value, tint }: { icon: React.ReactNode; label: string; value: number | string; tint: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{label}</p>
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${TINTS[tint]}`}>
          {icon}
        </div>
      </div>
      <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
