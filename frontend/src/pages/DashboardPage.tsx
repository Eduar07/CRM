import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, ArrowUp, ArrowDown, Calendar as CalIcon, BarChart2 } from "lucide-react";
import { useCompanies } from "../hooks/useCompanies";
import { useMeetings } from "../hooks/useMeetings";
import { useAuth } from "../hooks/useAuth";
import { useDashboardKpis } from "../hooks/useDashboardKpis";
import { getWeeklyActivity, type WeeklyActivity } from "../services/dashboard.service";
import type { Meeting } from "../types/meeting";
import type { Company } from "../types/company";

// ─── Stat Card ────────────────────────────────────────────────────────────────
type StatCardProps = {
  label: string;
  value: number | string;
  subtitle?: string;
  trend?: { direction: "up" | "down"; text: string };
  highlight?: boolean;
};
function StatCard({ label, value, subtitle, trend, highlight }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <p className="text-sm text-gray-500">{label}</p>
      {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
      <p className={`mt-1 text-3xl font-bold ${highlight ? "text-red-500" : "text-gray-900"}`}>{value}</p>
      {trend && (
        <div className={`mt-1 flex items-center gap-1 text-xs font-medium ${trend.direction === "up" ? "text-emerald-600" : "text-red-500"}`}>
          {trend.direction === "up" ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
          {trend.text}
        </div>
      )}
    </div>
  );
}

// ─── Activity Chart: barras agrupadas por día con datos reales ───────────────
const DAYS_LABELS = ["L", "M", "Mi", "J", "V", "S", "D"];

function buildDefaultWeek(): WeeklyActivity[] {
  return DAYS_LABELS.map((d) => ({ day: d, emails: 0, calls: 0, meetings: 0 }));
}

function ActivityChart({ data }: { data: WeeklyActivity[] }) {
  const week = data.length === 7 ? data : buildDefaultWeek();
  const totalEvents = week.reduce((acc, d) => acc + d.emails + d.calls + d.meetings, 0);
  const maxVal = Math.max(1, ...week.map(d => d.emails + d.calls + d.meetings));

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Actividad semanal</h3>
        <div className="flex gap-3 text-[10px] text-gray-500">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-indigo-500" />Emails</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" />Llamadas</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-400" />Reuniones</span>
        </div>
      </div>

      {totalEvents === 0 ? (
        <div className="flex h-32 flex-col items-center justify-center text-center">
          <BarChart2 size={26} className="text-gray-300 mb-2" />
          <p className="text-xs text-gray-500 font-medium">Sin actividad esta semana</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Las reuniones y emails aparecerán aquí</p>
        </div>
      ) : (
        <div className="flex h-32 items-end gap-3">
          {week.map((d, i) => {
            const total = d.emails + d.calls + d.meetings;
            const h = (total / maxVal) * 100;
            const heightPct = Math.max(h, total > 0 ? 6 : 0);
            return (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <div className="w-full flex flex-col justify-end" style={{ height: `${heightPct}%` }}>
                  {d.meetings > 0 && <div className="w-full bg-amber-400" style={{ flex: d.meetings }} />}
                  {d.calls > 0 && <div className="w-full bg-emerald-500" style={{ flex: d.calls }} />}
                  {d.emails > 0 && <div className="w-full rounded-t-md bg-indigo-500" style={{ flex: d.emails }} />}
                </div>
                <span className="text-[10px] text-gray-400">{DAYS_LABELS[i]}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Upcoming Meetings con empty state ────────────────────────────────────────
const DOT_COLORS = ["bg-blue-500", "bg-amber-400", "bg-gray-400"];

function formatMeetingTime(startTime: string): string {
  const d = new Date(startTime);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today.getTime() + 86_400_000);
  const meetDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const timeStr = d.toLocaleTimeString("es-CO", { hour: "numeric", minute: "2-digit" });
  if (meetDate.getTime() === today.getTime()) return `Hoy ${timeStr}`;
  if (meetDate.getTime() === tomorrow.getTime()) return `Mañana ${timeStr}`;
  return `${["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"][d.getDay()]} ${timeStr}`;
}

function UpcomingMeetings({ meetings }: { meetings: Meeting[] }) {
  const items = meetings.slice(0, 3);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">Próximas reuniones</h3>

      {/* FIX: empty state grande con CTA */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/50 py-8 text-center">
          <span className="text-2xl mb-2">🎯</span>
          <p className="text-sm font-semibold text-gray-900">No tienes reuniones pendientes</p>
          <p className="text-xs text-gray-500 mt-1">Agenda una para empezar a cerrar negocios</p>
          <Link to="/meetings"
            className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 hover:shadow-md transition-all">
            <CalIcon size={13} /> ¡Agenda una!
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((m, i) => (
            <div key={m.id} className="flex items-start gap-3">
              <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${DOT_COLORS[i % DOT_COLORS.length]}`} />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-gray-900">{m.title}</p>
                {m.description && <p className="text-[11px] text-gray-500">{m.description}</p>}
                {m.meetingLink && <p className="text-[11px] text-gray-400 truncate">{m.meetingLink}</p>}
              </div>
              <span className="shrink-0 whitespace-nowrap text-[11px] text-gray-400">
                {formatMeetingTime(m.startTime)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
const STATUS_CFG: Record<string, { label: string; cls: string }> = {
  "Nueva":       { label: "Nueva",      cls: "bg-gray-100 text-gray-700"   },
  "Contactada":  { label: "Contactada", cls: "bg-blue-100 text-blue-700"   },
  "En proceso":  { label: "En proceso", cls: "bg-amber-100 text-amber-700" },
  "Cerrada":     { label: "Cerrada",    cls: "bg-green-100 text-green-700" },
};
function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CFG[status] ?? { label: status, cls: "bg-gray-100 text-gray-600" };
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${cfg.cls}`}>{cfg.label}</span>;
}

// ─── Recent Companies Table ───────────────────────────────────────────────────
function RecentCompaniesTable({ companies, searchQuery }: { companies: Company[]; searchQuery: string }) {
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return companies;
    return companies.filter((c) =>
      c.name.toLowerCase().includes(q) ||
      (c.industry ?? "").toLowerCase().includes(q) ||
      (c.department ?? "").toLowerCase().includes(q) ||
      (c.assignedTo ?? "").toLowerCase().includes(q)
    );
  }, [companies, searchQuery]);

  const rows = filtered.slice(0, 5);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between px-5 py-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Empresas recientes</h3>
          {searchQuery && (
            <p className="text-[11px] text-gray-400 mt-0.5">
              {filtered.length} resultado{filtered.length !== 1 ? "s" : ""} para "{searchQuery}"
            </p>
          )}
        </div>
        <Link to="/companies" className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
          Ver todas
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="border-t border-gray-100">
            <tr>
              {["Empresa","Industria","Contacto","Estado","Asignada","Última interacción"].map(h => (
                <th key={h} className="px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center">
                  <p className="text-sm text-gray-400">
                    {searchQuery ? `Sin resultados para "${searchQuery}"` : "No hay empresas registradas aún"}
                  </p>
                </td>
              </tr>
            ) : rows.map((row) => (
              <tr key={row.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3 text-sm font-semibold text-gray-900">
                  <Link to={`/companies/${row.id}`} className="hover:text-indigo-600">{row.name}</Link>
                </td>
                <td className="px-5 py-3 text-sm text-gray-500">{row.industry ?? "—"}</td>
                <td className="px-5 py-3 text-sm text-gray-500">—</td>
                <td className="px-5 py-3"><StatusBadge status={row.contactStatus} /></td>
                <td className="px-5 py-3 text-sm text-gray-500">{row.assignedTo ?? "—"}</td>
                <td className="px-5 py-3 text-sm text-gray-400">{new Date(row.createdAt).toLocaleDateString("es-CO")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────
export function DashboardPage() {
  const { userId } = useAuth();
  const { meetings } = useMeetings(userId ?? undefined);
  const { companies } = useCompanies();
  const { kpis } = useDashboardKpis();

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [weekly, setWeekly] = useState<WeeklyActivity[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    void getWeeklyActivity().then(setWeekly);
  }, []);

  return (
    <div className="min-h-full bg-gray-50">
      <div className="border-b border-gray-200 bg-white">
        <div className="flex items-center gap-4 px-6 py-4">
          <h1 className="text-lg font-bold text-gray-900">Dashboard</h1>
          <div className="flex max-w-sm flex-1 items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 focus-within:border-indigo-400 focus-within:bg-white transition-colors">
            <Search size={15} className="text-gray-400" />
            <input
              type="text"
              placeholder="Buscar empresa, contacto..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput("")}
                className="text-xs text-gray-400 hover:text-gray-600 px-1"
                aria-label="Limpiar búsqueda"
              >
                ✕
              </button>
            )}
          </div>
          <div className="ml-auto">
            {/* FIX: bg-indigo-600 con !text-white para garantizar que nunca sea gris */}
            <Link
              to="/companies"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold !text-white shadow-sm hover:bg-indigo-700 hover:shadow-md active:bg-indigo-800 transition-all"
            >
              <Plus size={15} className="text-white" /> Nueva empresa
            </Link>
          </div>
        </div>
      </div>

      <div className="space-y-5 p-6">
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          <StatCard label="Empresas esta semana" value={kpis?.companiesThisWeek ?? 0}
            trend={{ direction: (kpis?.companiesDelta ?? 0) >= 0 ? "up" : "down",
              text: `${Math.abs(kpis?.companiesDelta ?? 0)} vs semana anterior` }} />
          <StatCard label="En proceso" value={kpis?.inProcess ?? 0}
            subtitle={`de ${kpis?.totalCompanies ?? 0} total`} />
          <StatCard label="Tareas pendientes" value={kpis?.pendingTasks ?? 0} highlight
            trend={{ direction: "down", text: `${kpis?.overdueTasks ?? 0} vencen hoy` }} />
          <StatCard label="Tasa de contacto" value={`${kpis?.contactRate ?? 0}%`}
            trend={{ direction: "up", text: "este periodo" }} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <ActivityChart data={weekly} />
          <UpcomingMeetings meetings={meetings} />
        </div>

        <RecentCompaniesTable companies={companies} searchQuery={debouncedSearch} />
      </div>
    </div>
  );
}
