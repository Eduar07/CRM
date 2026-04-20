export type UserRole = "SUPER_ADMIN" | "MARCELA_ADMIN" | "KAROLAIN_ADMIN";

export type LoginResponse = {
  userId: string;
  username: string;
  role: UserRole;
  accessToken: string;
  expiresAt: string;
};