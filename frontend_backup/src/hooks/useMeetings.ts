import { useEffect, useState } from "react";
import { listMeetingsByUser } from "../services/meeting.service";
import type { Meeting } from "../types/meeting";

export function useMeetings(userId?: string) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(Boolean(userId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setMeetings([]);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);

    listMeetingsByUser(userId)
      .then((data) => {
        if (active) {
          setMeetings(data);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? err.message : "No se pudieron cargar las reuniones");
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [userId]);

  return { meetings, loading, error };
}
