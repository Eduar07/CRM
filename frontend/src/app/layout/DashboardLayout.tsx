import { useState } from "react";
import { Outlet, useNavigate, NavLink, useLocation } from "react-router-dom";
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
  Moon,
  Sun,
  Sparkles,
  LogOut,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { logout } from "../../services/auth.service";
import { STORAGE_KEYS } from "../../utils/constants";
import { useTasksBadge } from "../../hooks/useTasksBadge";
import { useTheme } from "../../context/ThemeContext";

type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
};

const PRINCIPAL_NAV: NavItem[] = [
  { to: "/",          label: "Dashboard", icon: LayoutDashboard },
  { to: "/companies", label: "Empresas",  icon: Building2 },
  { to: "/pipeline",  label: "Pipeline",  icon: BarChart2 },
  { to: "/contacts",  label: "Contactos", icon: Users },
];

function SidebarLink({ to, label, icon: Icon, badge }: NavItem) {
  const getLinkClass = ({ isActive }: NavLinkRenderProps) =>
    [
      "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
      isActive
        ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 shadow-sm"
        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/70 dark:hover:text-gray-100",
    ].join(" ");

  return (
    <NavLink to={to} end={to === "/"} className={getLinkClass}>
      {({ isActive }: NavLinkRenderProps) => (
        <>
          {isActive && (
            <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-indigo-500 dark:bg-indigo-400" />
          )}
          <Icon
            size={17}
            className={
              isActive
                ? "text-indigo-600 dark:text-indigo-400"
                : "text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300 transition-colors"
            }
          />
          <span className="flex-1 truncate">{label}</span>
          {badge !== undefined && badge > 0 && (
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white shadow-sm">
              {badge > 99 ? "99+" : badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

function NavSection({ title, items }: { title: string; items: NavItem[] }) {
  return (
    <div>
      <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600">
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

export function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggle } = useTheme();
  const pendingTasksCount = useTasksBadge();

  const gestionNav: NavItem[] = [
    { to: "/tasks",    label: "Tareas",      icon: CheckSquare, badge: pendingTasksCount },
    { to: "/meetings", label: "Calendario",  icon: Calendar },
    { to: "/emails",   label: "Seguimiento", icon: BookOpen },
    { to: "/reports",  label: "Reportes",    icon: TrendingUp },
    { to: "/scraping", label: "Scraping",    icon: Sparkles },
  ];

  const username = localStorage.getItem(STORAGE_KEYS.username) ?? "marcela_admin";
  const initials = username.split("_")[0].slice(0, 2).toUpperCase();

  const doLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm md:hidden animate-fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-30 flex w-60 flex-col border-r border-gray-100 bg-white transition-transform duration-300 ease-in-out dark:border-gray-800/80 dark:bg-gray-900",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          "md:relative md:translate-x-0",
        ].join(" ")}
      >
        {/* Logo */}
        <div className="px-4 pb-4 pt-5">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white shadow-md"
              style={{ background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)" }}
            >
              C
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold leading-tight text-gray-900 dark:text-gray-100">Campusland</p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500">CRM v1.0</p>
            </div>
            <button
              onClick={toggle}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-400 transition-all hover:border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500 dark:hover:border-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
              aria-label="Cambiar tema"
              title={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            >
              {theme === "dark" ? <Sun size={13} /> : <Moon size={13} />}
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-4 mb-4 h-px bg-gray-100 dark:bg-gray-800" />

        {/* Nav */}
        <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-4">
          <NavSection title="Principal" items={PRINCIPAL_NAV} />
          <NavSection title="Gestión"   items={gestionNav} />
        </nav>

        {/* User footer */}
        <div className="border-t border-gray-100 p-3 dark:border-gray-800">
          <div className="mb-2 flex items-center gap-2.5 rounded-xl bg-gray-50 px-3 py-2.5 dark:bg-gray-800/60">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm"
              style={{ background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)" }}
            >
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-gray-900 dark:text-gray-100">{username}</p>
              <p className="truncate text-[11px] text-gray-400 dark:text-gray-500">Ejecutiva de ventas</p>
            </div>
          </div>
          <button
            onClick={doLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-500 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-gray-700 dark:text-gray-400 dark:hover:border-red-900/60 dark:hover:bg-red-950/30 dark:hover:text-red-400"
          >
            <LogOut size={13} />
            Cambiar usuario
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile topbar */}
        <header className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 md:hidden dark:border-gray-800 dark:bg-gray-900">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
            aria-label="Abrir menú"
          >
            <ChevronRight size={20} />
          </button>
          <span className="flex-1 font-semibold text-gray-900 dark:text-gray-100">Campusland CRM</span>
          <button
            onClick={toggle}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition-colors"
            aria-label="Cambiar tema"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </header>

        <main className="flex-1 overflow-auto">
          <div key={location.pathname} className="page-enter">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
