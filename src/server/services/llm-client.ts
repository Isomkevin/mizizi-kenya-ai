import type { IngestionLlmProvider } from "@/api/types";
import { serverEnv } from "@/server/env";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content:
    | string
    | Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }>;
}

export interface ChatCompletionResult {
  text: string;
  provider: IngestionLlmProvider;
}

async function callOpenAiCompatible(
  baseUrl: string,
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  provider: IngestionLlmProvider,
): Promise<string | null> {
  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.1,
      max_tokens: 1200,
      messages,
    }),
  });

  if (!response.ok) return null;

  const json = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = json.choices?.[0]?.message?.content?.trim();
  return content ?? null;
}

export async function chatCompletionWithFallback(
  messages: ChatMessage[],
): Promise<ChatCompletionResult | null> {
  const featherlessKey = serverEnv.featherlessApiKey();
  if (featherlessKey) {
    const text = await callOpenAiCompatible(
      serverEnv.featherlessBaseUrl(),
      featherlessKey,
      serverEnv.featherlessModel(),
      messages,
      "featherless",
    );
    if (text) return { text, provider: "featherless" };
  }

  const openRouterKey = serverEnv.openRouterApiKey();
  if (openRouterKey) {
    const text = await callOpenAiCompatible(
      serverEnv.openRouterBaseUrl(),
      openRouterKey,
      serverEnv.openRouterModel(),
      messages,
      "openrouter",
    );
    if (text) return { text, provider: "openrouter" };
  }

  return null;
}
