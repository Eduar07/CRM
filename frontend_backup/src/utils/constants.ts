export const STORAGE_KEYS = {
  token: "accessToken",
  role: "userRole",
  username: "username",
  userId: "userId"
} as const;

export const API_PATHS = {
  authLogin: "/auth/login",
  companies: "/companies",
  contacts: "/contacts",
  leads: "/leads",
  meetings: "/meetings",
  emails: "/emails"
} as const;
