import { NavLink } from "react-router-dom";
import { LayoutDashboard, Building2, KanbanSquare, Users, CalendarDays, Mail } from "lucide-react";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/companies", label: "Empresas", icon: Building2 },
  { to: "/pipeline", label: "Pipeline", icon: KanbanSquare },
  { to: "/contacts", label: "Contactos", icon: Users },
  { to: "/meetings", label: "Agenda", icon: CalendarDays },
  { to: "/emails", label: "Emails", icon: Mail }
];

export function Sidebar() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${
      isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
    }`;

  return (
    <nav className="space-y-2">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink key={item.to} to={item.to} className={linkClass} end={item.to === "/"}>
            <Icon size={18} />
            {item.label}
          </NavLink>
        );
      })}
    </nav>
  );
}
