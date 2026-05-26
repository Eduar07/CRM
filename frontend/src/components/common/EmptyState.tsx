type EmptyStateProps = {
  title: string;
  description?: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center dark:border-gray-700 dark:bg-gray-900">
      <p className="text-sm font-medium text-slate-900 dark:text-gray-100">{title}</p>
      {description ? <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">{description}</p> : null}
    </div>
  );
}
