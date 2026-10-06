export type UserRole = "user" | "admin";
export type SubscriptionPlan = "free" | "premium";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  plan: SubscriptionPlan;
  avatar?: string;
  createdAt: string;
}

export interface AuthResponse {
  user: AuthUser;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
}
