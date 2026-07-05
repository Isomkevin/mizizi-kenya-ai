import { createMiddleware } from "@tanstack/react-start";

/**
 * Server auth middleware for all createServerFn handlers.
 *
 * - In demo mode (explicit MIZIZI_DEMO/VITE_MIZIZI_DEMO=true, or Supabase not
 *   configured), allows the request through and returns a synthetic demo
 *   session so handlers behave as before. This preserves the current Lovable
 *   preview / hackathon UX.
 * - In production (Supabase configured, demo mode NOT explicitly on), requires
 *   a valid Supabase JWT in the `Authorization: Bearer <token>` header and
 *   verifies it against Supabase Auth before executing the handler. Missing
 *   or invalid tokens return HTTP 401.
 *
 * Handlers can read `context.session` for the authenticated user.
 */
export interface AuthedSession {
  userId: string;
  email?: string;
  role?: string;
  demo: boolean;
}

function unauthorized(message = "Unauthorized"): never {
  throw new Response(message, { status: 401 });
}

export const requireAuth = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const { serverEnv } = await import("@/server/env");
  const { getRequestHeader } = await import("@tanstack/react-start/server");

  const supabaseConfigured = Boolean(serverEnv.supabaseUrl() && serverEnv.supabaseAnonKey());
  if (serverEnv.demoMode() || !supabaseConfigured) {
    const session: AuthedSession = {
      userId: "dev-kevin-m",
      role: "loan_officer",
      demo: true,
    };
    return next({ context: { session } });
  }

  const authHeader =
    getRequestHeader("authorization") ?? getRequestHeader("Authorization");
  if (!authHeader?.toLowerCase().startsWith("bearer ")) {
    unauthorized();
  }
  const token = authHeader.slice(7).trim();
  if (!token) unauthorized();

  const url = serverEnv.supabaseUrl();
  const anon = serverEnv.supabaseAnonKey();
  if (!url || !anon) unauthorized("Invalid or expired session");

  let session: AuthedSession | null = null;
  try {
    const res = await fetch(`${url}/auth/v1/user`, {
      headers: { apikey: anon, Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const user = (await res.json()) as {
        id: string;
        email?: string;
        app_metadata?: { role?: string };
      };
      if (user?.id) {
        session = {
          userId: user.id,
          email: user.email,
          role: user.app_metadata?.role,
          demo: false,
        };
      }
    }
  } catch {
    session = null;
  }

  if (!session) unauthorized("Invalid or expired session");
  return next({ context: { session } });
});
