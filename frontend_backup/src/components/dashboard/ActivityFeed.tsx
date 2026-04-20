type ActivityFeedProps = {
  items: string[];
};

export function ActivityFeed({ items }: ActivityFeedProps) {
  return (
    <div className="rounded-3xl border bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold">Actividad reciente</h3>
      <div className="mt-4 space-y-3 text-sm text-slate-700">
        {items.map((item) => (
          <p key={item}>- {item}</p>
        ))}
      </div>
    </div>
  );
}
