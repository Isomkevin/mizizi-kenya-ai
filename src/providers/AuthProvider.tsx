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
  const hasSupabaseConfig = Boolean(
    import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY,
  );
  if (!hasSupabaseConfig) return DEV_SESSION;

  if (typeof window === "undefined") return import.meta.env.DEV ? DEV_SESSION : null;

  if (import.meta.env.DEV) return DEV_SESSION;

  const raw = window.localStorage.getItem("mizizi:session");
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}
