import { createMiddleware } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";

import { serverEnv } from "@/server/env";

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

async function verifySupabaseToken(token: string): Promise<AuthedSession | null> {
  const url = serverEnv.supabaseUrl();
  const anon = serverEnv.supabaseAnonKey();
  if (!url || !anon) return null;
  try {
    const res = await fetch(`${url}/auth/v1/user`, {
      headers: {
        apikey: anon,
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) return null;
    const user = (await res.json()) as {
      id: string;
      email?: string;
      app_metadata?: { role?: string };
      user_metadata?: { role?: string };
    };
    if (!user?.id) return null;
    return {
      userId: user.id,
      email: user.email,
      // Trust only server-side role claim (app_metadata), never user_metadata.
      role: user.app_metadata?.role,
      demo: false,
    };
  } catch {
    return null;
  }
}

function unauthorized(message = "Unauthorized"): never {
  throw new Response(message, { status: 401 });
}

export const requireAuth = createMiddleware({ type: "function" }).server(async ({ next }) => {
  if (serverEnv.demoMode()) {
    return next({
      context: {
        session: {
          userId: "dev-kevin-m",
          role: "loan_officer",
          demo: true,
        } satisfies AuthedSession,
      },
    });
  }

  const authHeader = getRequestHeader("authorization") ?? getRequestHeader("Authorization");
  if (!authHeader?.toLowerCase().startsWith("bearer ")) {
    unauthorized();
  }
  const token = authHeader.slice(7).trim();
  if (!token) unauthorized();

  const session = await verifySupabaseToken(token);
  if (!session) unauthorized("Invalid or expired session");

  return next({ context: { session } });
});
