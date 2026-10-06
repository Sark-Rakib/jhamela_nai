"use client";

import * as React from "react";

import { api, ApiError } from "@/lib/api";
import { track } from "@/lib/analytics";
import type { AuthUser, LoginInput, RegisterInput } from "./types";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  /** True when the API could not be reached — UI should stay in guest mode. */
  isOffline: boolean;
  login: (input: LoginInput) => Promise<AuthUser>;
  register: (input: RegisterInput) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isOffline, setIsOffline] = React.useState(false);

  const refresh = React.useCallback(async () => {
    try {
      const data = await api.get<{ user: AuthUser | null }>("/auth/me");
      setUser(data?.user ?? null);
      setIsOffline(false);
    } catch (error) {
      // 401 simply means "not signed in" — that is a valid, non-error state.
      if (error instanceof ApiError && error.isAuthError) {
        setUser(null);
        setIsOffline(false);
      } else if (error instanceof ApiError && error.isOffline) {
        setUser(null);
        setIsOffline(true);
      } else {
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const controller = new AbortController();
    let active = true;

    // State is only settled inside promise callbacks (never synchronously in the
    // effect body), so hydration never triggers a cascading render.
    api
      .get<{ user: AuthUser | null }>("/auth/me", { signal: controller.signal })
      .then((data) => {
        if (!active) return;
        setUser(data?.user ?? null);
        setIsOffline(false);
      })
      .catch((error: unknown) => {
        if (!active || (error as Error)?.name === "AbortError") return;
        // 401 simply means "not signed in" — a valid, non-error state.
        if (error instanceof ApiError) {
          setIsOffline(error.isOffline);
        }
        setUser(null);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  const login = React.useCallback(async (input: LoginInput) => {
    const data = await api.post<{ user: AuthUser }>("/auth/login", input);
    setUser(data.user);
    setIsOffline(false);
    track("user_logged_in");
    return data.user;
  }, []);

  const register = React.useCallback(async (input: RegisterInput) => {
    const data = await api.post<{ user: AuthUser }>("/auth/register", input);
    setUser(data.user);
    setIsOffline(false);
    track("user_registered");
    return data.user;
  }, []);

  const logout = React.useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      /* the cookie may already be gone — clear local state regardless */
    }
    setUser(null);
  }, []);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === "admin",
      isOffline,
      login,
      register,
      logout,
      refresh,
    }),
    [user, isLoading, isOffline, login, register, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = React.useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
}
