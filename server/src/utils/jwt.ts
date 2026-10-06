import jwt, { type SignOptions } from "jsonwebtoken";

import { env, isProduction } from "../config/env.js";
import type { TokenUser } from "../types/express.js";

const ISSUER = "jhamela-nai";

export function signToken(user: TokenUser): string {
  const payload: TokenUser = {
    id: user.id,
    email: user.email,
    role: user.role,
  };
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
    issuer: ISSUER,
  } as SignOptions);
}

export function verifyToken(token: string): TokenUser {
  const decoded = jwt.verify(token, env.JWT_SECRET, { issuer: ISSUER });
  if (typeof decoded === "string") {
    throw new Error("Unexpected token payload");
  }
  return { id: String(decoded.id), email: String(decoded.email), role: decoded.role === "admin" ? "admin" : "user" };
}

export const cookieOptions = {
  httpOnly: true,
  sameSite: isProduction ? ("none" as const) : ("lax" as const),
  secure: isProduction,
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};