export function env(key: string): string | undefined {
  if (typeof process !== "undefined" && process.env[key]) {
    return process.env[key];
  }
  if (typeof import.meta !== "undefined" && import.meta.env) {
    const v = import.meta.env[key] as string | undefined;
    if (v) return v;
  }
  return undefined;
}

export const serverEnv = {
  supabaseUrl: () => env("SUPABASE_URL") ?? env("VITE_SUPABASE_URL"),
  supabaseAnonKey: () => env("SUPABASE_ANON_KEY") ?? env("VITE_SUPABASE_ANON_KEY"),
  supabaseServiceKey: () => env("SUPABASE_SERVICE_ROLE_KEY"),
  neo4jUri: () => env("NEO4J_URI"),
  neo4jUser: () => env("NEO4J_USER") ?? "neo4j",
  neo4jPassword: () => env("NEO4J_PASSWORD"),
  openAiKey: () => env("OPENAI_API_KEY"),
  featherlessApiKey: () => env("FEATHERLESS_API_KEY"),
  featherlessBaseUrl: () => env("FEATHERLESS_BASE_URL") ?? "https://api.featherless.ai/v1",
  featherlessModel: () =>
    env("FEATHERLESS_MODEL") ?? "mistralai/Mixtral-8x7B-Instruct-v0.1",
  openRouterApiKey: () => env("OPENROUTER_API_KEY"),
  openRouterBaseUrl: () => env("OPENROUTER_BASE_URL") ?? "https://openrouter.ai/api/v1",
  openRouterModel: () => env("OPENROUTER_MODEL") ?? "meta-llama/llama-3.1-70b-instruct",
  tenantId: () => env("MIZIZI_TENANT_ID") ?? "lesom-sandbox",
  useLocalStore: () => !serverEnv.supabaseUrl() || env("MIZIZI_USE_LOCAL_STORE") === "true",
};
