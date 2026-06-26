import type { DecisionFactor, FarmerProfile } from "@/api/types";
import { serverEnv } from "@/server/env";

interface ExplanationInput {
  farmer: FarmerProfile;
  recommendation: string;
  confidence: number;
  factors: DecisionFactor[];
  positiveSignals: string[];
  negativeSignals: string[];
}

export interface GeneratedExplanation {
  officerExplanation: string;
  farmerExplanation: string;
  source: "template" | "openai";
}

function groundedTemplate(input: ExplanationInput): GeneratedExplanation {
  const topFactors = input.factors
    .slice()
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 3)
    .map((factor) => `${factor.label} (${Math.round(factor.weight * 100)}%)`)
    .join(", ");

  const officerExplanation = [
    `Recommendation: ${input.recommendation.replace(/_/g, " ")}.`,
    `Confidence: ${Math.round(input.confidence * 100)}%.`,
    `Top factors: ${topFactors || "No factor data available"}.`,
    input.negativeSignals.length ? `Primary risk alerts: ${input.negativeSignals.join(" ")}` : "",
    input.positiveSignals.length
      ? `Primary stabilizers: ${input.positiveSignals.join(" ")}`
      : "",
    "Grounding note: this explanation is generated strictly from stored risk factors and profile evidence.",
  ]
    .filter(Boolean)
    .join(" ");

  const farmerExplanation = [
    `Your application is currently marked as ${input.recommendation.replace(/_/g, " ")}.`,
    `Confidence is ${Math.round(input.confidence * 100)}%.`,
    `The strongest drivers are ${topFactors || "available repayment, climate, and profile signals"}.`,
    input.negativeSignals.length
      ? `We flagged: ${input.negativeSignals.slice(0, 2).join(" ")}`
      : "No major risk flags were detected from the latest data.",
  ].join(" ");

  return { officerExplanation, farmerExplanation, source: "template" };
}

export async function generateGroundedExplanation(
  input: ExplanationInput,
): Promise<GeneratedExplanation> {
  const apiKey = serverEnv.openAiKey();
  if (!apiKey) return groundedTemplate(input);

  const prompt = {
    farmerId: input.farmer.farmerId,
    county: input.farmer.county,
    recommendation: input.recommendation,
    confidence: input.confidence,
    factors: input.factors.map((factor) => ({
      label: factor.label,
      direction: factor.direction,
      weight: factor.weight,
      confidence: factor.confidence,
      source: factor.source,
    })),
    positiveSignals: input.positiveSignals,
    negativeSignals: input.negativeSignals,
  };

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content:
              "Return concise grounded credit explanations only from provided JSON facts. If facts are missing, say unavailable.",
          },
          {
            role: "user",
            content: `Produce JSON with keys officerExplanation and farmerExplanation only.\n${JSON.stringify(prompt)}`,
          },
        ],
      }),
    });

    if (!response.ok) return groundedTemplate(input);

    const json = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = json.choices?.[0]?.message?.content?.trim();
    if (!content) return groundedTemplate(input);

    const parsed = JSON.parse(content) as {
      officerExplanation?: string;
      farmerExplanation?: string;
    };

    if (!parsed.officerExplanation || !parsed.farmerExplanation) {
      return groundedTemplate(input);
    }

    return {
      officerExplanation: parsed.officerExplanation,
      farmerExplanation: parsed.farmerExplanation,
      source: "openai",
    };
  } catch {
    return groundedTemplate(input);
  }
}
