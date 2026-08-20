import { createServerFn } from "@tanstack/react-start";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { z } from "zod";

const SnapshotInput = z.object({
  hasData: z.boolean(),
  latest: z
    .object({
      total_kg: z.number(),
      transport_kg: z.number(),
      energy_kg: z.number(),
      food_kg: z.number(),
      waste_kg: z.number(),
      created_at: z.string(),
    })
    .nullable(),
  history: z.array(z.object({ total_kg: z.number(), created_at: z.string() })).max(24),
  goals: z
    .array(
      z.object({
        title: z.string().max(200),
        target_value: z.number(),
        current_value: z.number(),
        status: z.string().max(40),
      }),
    )
    .max(20),
  travel: z
    .array(
      z.object({
        mode: z.string().max(40),
        distance_km: z.number(),
        trips_per_week: z.number(),
      }),
    )
    .max(20),
});

const ChatInput = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(4000),
      }),
    )
    .min(1)
    .max(30),
  snapshot: SnapshotInput,
});

/**
 * AI Sustainability Coach. Runs server-side only; the model only sees the local
 * data the browser sends with the request, and it is explicitly told not to invent data.
 */
export const coachChat = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ChatInput.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env["OPENAI_API_KEY"];
    if (!apiKey) {
      return { ok: false as const, reason: "not_configured" as const };
    }

    const snapshot = data.snapshot;

    const system = [
      "You are the EcoTrack AI Coach, a campus sustainability assistant.",
      "You may ONLY reason about the user data provided in the DATA block below.",
      "Never invent numbers, activities, locations or history that are not in DATA.",
      "If DATA is missing what a question needs, say exactly which data the user must add (e.g. run the Carbon Calculator, add a travel record).",
      "Always describe figures as estimated CO2e, never as exact measurements.",
      "Be concise, practical and specific to Indian campus life. Prefer 3-5 short bullet points with expected estimated savings in kg CO2e where the data supports it.",
      `DATA: ${JSON.stringify(snapshot)}`,
    ].join("\n");

    const openai = createOpenAI({
  apiKey,
});

    try {
      const result = streamText({
        model: openai("gpt-5.4"),
        system,
        messages: data.messages,
        providerOptions: {
          openai: {
            forceReasoning: true,
            reasoningEffort: "low",
            reasoningSummary: "auto",
            store: false,
            include: ["reasoning.encrypted_content"],
          },
        },
      });

      const text = await result.text;
      return {
        ok: true as const,
        text: text?.trim() || "I could not produce an answer for that. Try rephrasing your question.",
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown AI gateway error";
      const status = /402/.test(message)
        ? "Your workspace is out of AI credits. Add credits to keep using the AI Coach."
        : /429/.test(message)
          ? "The AI Coach is rate limited right now. Please try again in a moment."
          : message;
      return { ok: false as const, reason: "error" as const, message: status };
    }
  });
