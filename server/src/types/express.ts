import "express";

export type UserRole = "user" | "admin";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: UserRole;
      };
    }
  }
}

export interface TokenUser {
  id: string;
  email: string;
  role: UserRole;
}