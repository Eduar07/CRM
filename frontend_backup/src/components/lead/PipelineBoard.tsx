import type { LeadStatus, Lead } from "../../types/lead";
import { LeadCard } from "./LeadCard";

type PipelineBoardProps = {
  byStage: Record<LeadStatus, Lead[]>;
};

export function PipelineBoard({ byStage }: PipelineBoardProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-4">
      {Object.entries(byStage).map(([stage, leads]) => (
        <section key={stage} className="rounded-3xl border bg-white p-4 shadow-sm">
          <h3 className="font-semibold">{stage}</h3>
          <div className="mt-4 space-y-3">
            {leads.map((lead) => (
              <LeadCard key={lead.id} lead={lead} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
