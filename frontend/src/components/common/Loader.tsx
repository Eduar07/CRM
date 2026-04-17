export function Loader({ text = "Cargando..." }: { text?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
      {text}
    </div>
  );
}
