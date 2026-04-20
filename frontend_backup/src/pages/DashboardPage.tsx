import { ActivityFeed } from "../components/dashboard/ActivityFeed";
import { StatCard } from "../components/dashboard/StatCard";

export function DashboardPage() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Empresas" value={128} />
      <StatCard label="Contactos" value={314} />
      <StatCard label="Leads activos" value={47} />
      <StatCard label="Reuniones" value={12} />

      <div className="md:col-span-2 xl:col-span-4">
        <ActivityFeed
          items={[
            "Email enviado a CTO de Empresa X",
            "Reunión agendada con Marcela Admin",
            "Lead actualizado a REPLIED"
          ]}
        />
      </div>
    </div>
  );
}
