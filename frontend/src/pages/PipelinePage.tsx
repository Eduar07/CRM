export function PipelinePage() {
  return (
    <div className="grid gap-4 lg:grid-cols-4">
      {["NEW", "CONTACTED", "REPLIED", "CLOSED"].map((stage) => (
        <div key={stage} className="rounded-3xl bg-white p-4 shadow-sm border">
          <h3 className="font-semibold">{stage}</h3>
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl border p-3 text-sm">Empresa X — CTO</div>
            <div className="rounded-2xl border p-3 text-sm">Empresa Y — CEO</div>
          </div>
        </div>
      ))}
    </div>
  );
}