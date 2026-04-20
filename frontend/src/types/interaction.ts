export type Interaction = {
  id: string;
  companyId: string;
  userId: string;
  type: "call" | "email" | "meeting";
  notes: string | null;
  createdAt: string;
};

export type CreateInteractionRequest = {
  companyId: string;
  type: string;
  notes?: string;
};
