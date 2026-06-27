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
  neo4jDatabase: () => env("NEO4J_DATABASE") ?? "neo4j",
  neo4jProfile: () => {
    const explicit = env("NEO4J_PROFILE");
    if (explicit === "local" || explicit === "aura" || explicit === "custom") return explicit;
    const uri = env("NEO4J_URI")?.toLowerCase() ?? "";
    if (uri.includes("databases.neo4j.io") || uri.startsWith("neo4j+s://")) return "aura";
    if (uri.includes("localhost") || uri.includes("127.0.0.1") || uri.startsWith("bolt://")) {
      return "local";
    }
    return uri ? "custom" : undefined;
  },
  neo4jGdsEnabled: () => env("NEO4J_GDS") === "true" || env("NEO4J_GDS") === "1",
  openAiKey: () => env("OPENAI_API_KEY"),
  featherlessApiKey: () => env("FEATHERLESS_API_KEY"),
  featherlessBaseUrl: () => env("FEATHERLESS_BASE_URL") ?? "https://api.featherless.ai/v1",
  featherlessModel: () => env("FEATHERLESS_MODEL") ?? "mistralai/Mixtral-8x7B-Instruct-v0.1",
  openRouterApiKey: () => env("OPENROUTER_API_KEY"),
  openRouterBaseUrl: () => env("OPENROUTER_BASE_URL") ?? "https://openrouter.ai/api/v1",
  openRouterModel: () => env("OPENROUTER_MODEL") ?? "meta-llama/llama-3.1-70b-instruct",
  tenantId: () => env("MIZIZI_TENANT_ID") ?? "lesom-sandbox",
  useLocalStore: () => !serverEnv.supabaseUrl() || env("MIZIZI_USE_LOCAL_STORE") === "true",
  masumiMode: () => {
    const mode = env("MASUMI_MODE");
    if (mode === "live" || mode === "demo" || mode === "disabled") return mode;
    return env("MASUMI_AGENTS_URL") ? "demo" : "disabled";
  },
  masumiAgentsUrl: () => env("MASUMI_AGENTS_URL") ?? "http://localhost:8080",
  masumiPaymentUrl: () => env("MASUMI_PAYMENT_URL") ?? "http://localhost:3001/api/v1",
  masumiPaymentApiKey: () => env("MASUMI_PAYMENT_API_KEY"),
  masumiCallbackSecret: () => env("MASUMI_CALLBACK_SECRET") ?? "mizizi-dev-callback-secret",
  masumiClimateAgentPath: () => env("MASUMI_CLIMATE_AGENT_PATH") ?? "/climate",
  masumiCoopAgentPath: () => env("MASUMI_COOP_AGENT_PATH") ?? "/coop",
  masumiMobileAgentPath: () => env("MASUMI_MOBILE_AGENT_PATH") ?? "/mobile",
  masumiOrchestratorPath: () => env("MASUMI_ORCHESTRATOR_PATH") ?? "/orchestrator",
};
