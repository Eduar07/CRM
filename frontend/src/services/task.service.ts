import { api } from "./api";
import { API_PATHS } from "../utils/constants";
import type { Task, CreateTaskRequest } from "../types/task";

export async function listMyTasks(): Promise<Task[]> {
  const { data } = await api.get<Task[]>(API_PATHS.tasks);
  return data;
}

export async function createTask(payload: CreateTaskRequest): Promise<Task> {
  const { data } = await api.post<Task>(API_PATHS.tasks, payload);
  return data;
}

export async function completeTask(taskId: string): Promise<Task> {
  const { data } = await api.put<Task>(`${API_PATHS.tasks}/${taskId}/complete`);
  return data;
}
