import { api } from "./api";
import { API_PATHS } from "../utils/constants";
import type { Meeting, ScheduleMeetingRequest } from "../types/meeting";

export async function listMeetingsByUser(userId: string): Promise<Meeting[]> {
  const { data } = await api.get<Meeting[]>(API_PATHS.meetings, {
    params: { userId }
  });
  return data;
}

export async function scheduleMeeting(payload: ScheduleMeetingRequest): Promise<Meeting> {
  const { data } = await api.post<Meeting>(API_PATHS.meetings, payload);
  return data;
}
