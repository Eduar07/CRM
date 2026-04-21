import { useEffect, useState } from "react";
import { listMyTasks } from "../services/task.service";

/**
 * BUG #7 FIX — Devuelve el número REAL de tareas pendientes del usuario logueado.
 * - Refresca cada 5 min automáticamente.
 * - Si falla el backend o no hay tareas, devuelve 0 (el badge en el sidebar se oculta).
 */
export function useTasksBadge(): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let active = true;

    const fetchCount = async () => {
      try {
        const tasks = await listMyTasks();
        if (!active) return;
        const pending = tasks.filter((t) => t.status === "PENDING").length;
        setCount(pending);
      } catch {
        if (active) setCount(0); // ante cualquier error, ocultar badge
      }
    };

    void fetchCount();
    const id = setInterval(fetchCount, 5 * 60 * 1000);

    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  return count;
}
