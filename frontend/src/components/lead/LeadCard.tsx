import type { Lead } from "../../types/lead";

type LeadCardProps = {
  lead: Lead;
};

export function LeadCard({ lead }: LeadCardProps) {
  return (
    <article className="rounded-2xl border bg-white p-3 text-sm">
      <p className="font-medium">Lead #{lead.id.slice(0, 8)}</p>
      <p className="mt-1 text-slate-600">Fuente: {lead.source}</p>
      <p className="text-slate-600">Estado: {lead.status}</p>
    </article>
  );
}
