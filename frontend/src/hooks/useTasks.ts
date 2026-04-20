import { useEffect, useState } from "react";
import { listMyTasks } from "../services/task.service";
import type { Task } from "../types/task";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      setTasks(await listMyTasks());
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar las tareas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void refresh(); }, []);

  return { tasks, loading, error, refresh };
}
