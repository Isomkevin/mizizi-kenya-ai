import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

import type { UserRole } from "@/api/types";

export interface AuthSession {
  userId: string;
  name: string;
  role: UserRole;
}

const DEV_SESSION: AuthSession = {
  userId: "dev-kevin-m",
  name: "Kevin M.",
  role: "loan_officer",
};

interface AuthContextShape {
  session: AuthSession | null;
  setSession: (session: AuthSession | null) => void;
}

const AuthContext = createContext<AuthContextShape | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => getAuthSessionSnapshot());
  const value = useMemo(() => ({ session, setSession }), [session]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function getAuthSessionSnapshot(): AuthSession | null {
  // Demo/dev session is ONLY available when explicitly enabled or in local dev.
  // In production, an unconfigured Supabase MUST NOT silently grant an
  // authenticated session — the user is signed-out until they log in.
  const explicitDemo = import.meta.env.VITE_MIZIZI_DEMO === "true";
  const isDev = Boolean(import.meta.env.DEV);
  if (explicitDemo || isDev) return DEV_SESSION;

  if (typeof window === "undefined") return null;

  // NOTE: The client-side session is a UI hint only. Roles here are NOT
  // trusted — server functions re-verify identity/role via Supabase JWT.
  const raw = window.localStorage.getItem("mizizi:session");
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

