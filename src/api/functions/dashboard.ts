import { createServerFn } from "@tanstack/react-start";
import { requireAuth } from "@/server/middleware/require-auth";

import { getDashboard } from "@/server/services/dashboard";

export const getDashboardFn = createServerFn({ method: "GET" }).middleware([requireAuth]).handler(async () => {
  return getDashboard();
});
