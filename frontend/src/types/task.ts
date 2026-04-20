export type Task = {
  id: string;
  userId: string;
  companyId: string | null;
  description: string;
  dueDate: string | null;
  status: "PENDING" | "COMPLETED";
  createdAt: string;
};

export type CreateTaskRequest = {
  companyId?: string;
  description: string;
  dueDate?: string;
};
