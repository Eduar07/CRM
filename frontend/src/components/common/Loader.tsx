export function Loader({ text = "Cargando..." }: { text?: string }) {
  return (
    <div className="flex items-center justify-center p-16">
      <div className="text-center">
        <div className="relative mx-auto mb-4 h-11 w-11">
          <div className="absolute inset-0 rounded-full border-2 border-gray-100 dark:border-gray-800" />
          <div className="animate-spin-slow absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-500" />
          <div
            className="animate-spin-slow absolute inset-1 rounded-full border-2 border-transparent border-t-indigo-300 delay-150"
            style={{ animationDirection: "reverse", animationDuration: "0.7s" }}
          />
        </div>
        <p className="text-sm font-medium text-gray-400 dark:text-gray-500">{text}</p>
      </div>
    </div>
  );
}

export function LoaderInline({ text = "Cargando..." }: { text?: string }) {
  return (
    <div className="flex items-center gap-2.5 px-4 py-3 text-sm text-gray-400 dark:text-gray-500">
      <svg className="animate-spin-slow h-4 w-4 shrink-0 text-indigo-500" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" style={{ opacity: 0.2 }} />
        <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" style={{ opacity: 0.8 }} />
      </svg>
      {text}
    </div>
  );
}
