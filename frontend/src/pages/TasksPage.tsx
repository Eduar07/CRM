import { useState } from "react";
import { CheckCircle, Circle, Plus, AlertTriangle } from "lucide-react";
import { useTasks } from "../hooks/useTasks";
import { completeTask, createTask } from "../services/task.service";
import { Loader, EmptyState } from "../components/common";

export function TasksPage() {
  const { tasks, loading, error, refresh } = useTasks();
  const [showForm, setShowForm] = useState(false);
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const handleCreate = async () => {
    if (!description.trim()) return;
    setSaving(true);
    try {
      await createTask({ description, dueDate: dueDate || undefined });
      setDescription(""); setDueDate(""); setShowForm(false);
      await refresh();
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async (id: string) => {
    await completeTask(id);
    await refresh();
  };

  const pending = tasks.filter(t => t.status === "PENDING");
  const completed = tasks.filter(t => t.status === "COMPLETED");
  const overdue = pending.filter(t => t.dueDate && t.dueDate < today);

  return (
    <div className="min-h-full bg-gray-50">
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Tareas</h1>
            <p className="text-sm text-gray-500">{pending.length} pendientes · {completed.length} completadas</p>
          </div>
          <button onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 transition-colors">
            <Plus size={15} /> Nueva tarea
          </button>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {showForm && (
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">Nueva tarea</h3>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Descripción de la tarea..."
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 resize-none" rows={3} />
            <div className="flex items-center gap-3">
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400" />
              <button onClick={handleCreate} disabled={saving || !description.trim()}
                className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60 transition-colors">
                {saving ? "Guardando..." : "Guardar"}
              </button>
              <button onClick={() => setShowForm(false)} className="text-sm text-gray-500 hover:text-gray-700">Cancelar</button>
            </div>
          </div>
        )}

        {loading && <Loader text="Cargando tareas..." />}
        {error && <EmptyState title="Error" description={error} />}

        {overdue.length > 0 && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3">
            <AlertTriangle size={16} className="text-red-500 shrink-0" />
            <p className="text-sm text-red-700 font-medium">{overdue.length} {overdue.length === 1 ? "tarea vencida" : "tareas vencidas"}</p>
          </div>
        )}

        {!loading && !error && pending.length === 0 && completed.length === 0 && (
          <EmptyState title="Sin tareas" description="Crea tu primera tarea con el botón de arriba." />
        )}

        {pending.length > 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="px-5 py-3 border-b border-gray-100">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Pendientes ({pending.length})</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {pending.map((task) => {
                const isOverdue = task.dueDate && task.dueDate < today;
                return (
                  <div key={task.id} className="flex items-start gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                    <button onClick={() => handleComplete(task.id)} className="mt-0.5 shrink-0 text-gray-400 hover:text-green-500 transition-colors">
                      <Circle size={18} />
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{task.description}</p>
                      {task.dueDate && (
                        <p className={`text-xs mt-0.5 ${isOverdue ? "text-red-500 font-medium" : "text-gray-400"}`}>
                          {isOverdue ? "⚠ Venció el " : "Vence: "}
                          {new Date(task.dueDate + "T12:00:00").toLocaleDateString("es-CO")}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {completed.length > 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm opacity-70">
            <div className="px-5 py-3 border-b border-gray-100">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Completadas ({completed.length})</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {completed.map((task) => (
                <div key={task.id} className="flex items-start gap-3 px-5 py-3">
                  <CheckCircle size={18} className="mt-0.5 shrink-0 text-green-500" />
                  <p className="text-sm text-gray-400 line-through">{task.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
