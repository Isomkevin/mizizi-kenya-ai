import { createServerFn } from "@tanstack/react-start";

import { getDashboard } from "@/server/services/dashboard";

export const getDashboardFn = createServerFn({ method: "GET" }).handler(async () => {
  return getDashboard();
});
