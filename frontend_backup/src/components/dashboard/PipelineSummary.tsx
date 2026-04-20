import type { LeadStatus } from "../../types/lead";

type PipelineSummaryProps = {
  counts: Record<LeadStatus, number>;
};

export function PipelineSummary({ counts }: PipelineSummaryProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {Object.entries(counts).map(([stage, total]) => (
        <div key={stage} className="rounded-2xl border bg-white p-4 text-sm shadow-sm">
          <p className="text-slate-500">{stage}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{total}</p>
        </div>
      ))}
    </div>
  );
}
