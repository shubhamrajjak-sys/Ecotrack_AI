import { createServerFn } from "@tanstack/react-start";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
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
    const apiKey =
      process.env["OPENAI_API_KEY"] ||
      process.env["VITE_OPENAI_API_KEY"];

    if (!apiKey || apiKey.trim() === "" || apiKey === "your-openai-api-key") {
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

    const modelName = process.env["OPENAI_MODEL"] || "gpt-4o-mini";

    try {
      const result = await generateText({
        model: openai(modelName),
        system,
        messages: data.messages,
      });

      const text = result.text;
      return {
        ok: true as const,
        text: text?.trim() || "I could not produce an answer for that. Try rephrasing your question.",
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown AI gateway error";
      let status = message;
      if (/401|invalid_api_key|Incorrect API key/i.test(message)) {
        status = "Invalid OpenAI API key. Please check your OPENAI_API_KEY in the .env file.";
      } else if (/402|insufficient_quota|out of AI credits/i.test(message)) {
        status = "Your OpenAI account is out of credits or quota. Please check your billing at platform.openai.com.";
      } else if (/429|rate limit/i.test(message)) {
        status = "The AI Coach is rate limited right now. Please try again in a moment.";
      }
      return { ok: false as const, reason: "error" as const, message: status };
    }
  });
