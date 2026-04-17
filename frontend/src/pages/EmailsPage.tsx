export function EmailsPage() {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm border">
      <h1 className="text-xl font-bold">Emails</h1>
      <div className="mt-4 space-y-3">
        <div className="rounded-2xl border p-4">
          <p className="font-medium">Asunto: Formación y desarrollo de talento</p>
          <p className="text-sm text-slate-500">Estado: SENT</p>
        </div>
      </div>
    </div>
  );
}