"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

import { TooltipProvider } from "@/components/ui/primitives";
import { AuthProvider } from "@/features/auth/auth-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => {
              const status = (error as { status?: number } | null)?.status;
              if (status && status >= 400 && status < 500) return false;
              return failureCount < 2;
            },
          },
        },
      }),
  );

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="jhamela-nai-theme"
    >
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            {children}
            <Toaster
              position="top-center"
              richColors
              closeButton
              toastOptions={{ duration: 3200 }}
            />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </NextThemesProvider>
  );
}

/** Client helper for theme-aware logo rendering. */
export function useThemeMode() {
  const { resolvedTheme } = useTheme();
  return resolvedTheme ?? "light";
}
