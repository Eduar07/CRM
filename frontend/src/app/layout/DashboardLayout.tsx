import { useState } from "react";
import { Outlet, useNavigate, NavLink } from "react-router-dom";
import type { NavLinkRenderProps } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  BarChart2,
  Users,
  CheckSquare,
  Calendar,
  BookOpen,
  TrendingUp,
  ChevronRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { logout } from "../../services/auth.service";
import { STORAGE_KEYS } from "../../utils/constants";

// ─── Types ────────────────────────────────────────────────────────────────────
type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
};

// ─── Nav data ─────────────────────────────────────────────────────────────────
const PRINCIPAL_NAV: NavItem[] = [
  { to: "/",          label: "Dashboard", icon: LayoutDashboard },
  { to: "/companies", label: "Empresas",  icon: Building2 },
  { to: "/pipeline",  label: "Pipeline",  icon: BarChart2 },
  { to: "/contacts",  label: "Contactos", icon: Users },
];

const GESTION_NAV: NavItem[] = [
  { to: "/tasks",    label: "Tareas",      icon: CheckSquare, badge: 4 },
  { to: "/meetings", label: "Calendario",  icon: Calendar },
  { to: "/emails",   label: "Seguimiento", icon: BookOpen },
  { to: "/reports",  label: "Reportes",    icon: TrendingUp },
];

// ─── Sidebar link ─────────────────────────────────────────────────────────────
function SidebarLink({ to, label, icon: Icon, badge }: NavItem) {
  const getLinkClass = ({ isActive }: NavLinkRenderProps) =>
    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
      isActive
        ? "bg-gray-900 text-white"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
    }`;

  return (
    <NavLink to={to} end={to === "/"} className={getLinkClass}>
      {({ isActive }: NavLinkRenderProps) => (
        <>
          <Icon size={17} className={isActive ? "text-white" : "text-gray-500"} />
          <span className="flex-1">{label}</span>
          {badge !== undefined && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white">
              {badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

// ─── Nav section ──────────────────────────────────────────────────────────────
function NavSection({ title, items }: { title: string; items: NavItem[] }) {
  return (
    <div>
      <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
        {title}
      </p>
      <div className="space-y-0.5">
        {items.map((item) => (
          <SidebarLink key={item.to} {...item} />
        ))}
      </div>
    </div>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────
export function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const username = localStorage.getItem(STORAGE_KEYS.username) ?? "marcela_admin";
  const initials = username.split("_")[0].slice(0, 2).toUpperCase();

  const doLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-30 flex w-60 flex-col border-r border-gray-200 bg-white transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          "md:relative md:translate-x-0",
        ].join(" ")}
      >
        {/* Logo */}
        <div className="px-5 pb-5 pt-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-900 text-sm font-bold text-white">
              C
            </div>
            <div>
              <p className="text-sm font-bold leading-tight text-gray-900">Campusland</p>
              <p className="text-[11px] text-gray-400">CRM v1.0</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-4">
          <NavSection title="Principal" items={PRINCIPAL_NAV} />
          <NavSection title="Gestión"   items={GESTION_NAV} />
        </nav>

        {/* User footer */}
        <div className="space-y-2 border-t border-gray-100 p-4">
          <div className="flex items-start gap-3 rounded-xl bg-gray-50 px-3 py-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-800 text-xs font-bold text-white">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-gray-900">{username}</p>
              <p className="truncate text-[11px] text-gray-500">Ejecutiva de ventas</p>
              <span className="mt-1 inline-block rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-medium text-gray-700">
                Santander
              </span>
            </div>
          </div>
          <button
            onClick={doLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-500 transition-colors hover:bg-gray-100"
          >
            Cambiar usuario
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile topbar */}
        <header className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 md:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-1.5 hover:bg-gray-100"
            aria-label="Abrir menú"
          >
            <ChevronRight size={20} />
          </button>
          <span className="font-semibold text-gray-900">Campusland CRM</span>
        </header>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
