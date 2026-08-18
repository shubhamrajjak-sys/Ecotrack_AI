import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createServerFn } from "@tanstack/react-start";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { z } from "zod";

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
});

type Snapshot = {
  hasData: boolean;
  latest: {
    total_kg: number;
    transport_kg: number;
    energy_kg: number;
    food_kg: number;
    waste_kg: number;
    created_at: string;
  } | null;
  history: { total_kg: number; created_at: string }[];
  goals: { title: string; target_value: number; current_value: number; status: string }[];
  travel: { mode: string; distance_km: number; trips_per_week: number }[];
};

/**
 * AI Sustainability Coach. Runs server-side only; the model never sees data the
 * signed-in user does not own, and it is explicitly told not to invent data.
 */
export const coachChat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ChatInput.parse(input))
  .handler(async ({ data, context }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) {
      return { ok: false as const, reason: "not_configured" as const };
    }

    const { supabase, userId } = context;

    const [calcRes, goalRes, travelRes] = await Promise.all([
      supabase
        .from("carbon_calculations")
        .select("total_kg, transport_kg, energy_kg, food_kg, waste_kg, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(12),
      supabase
        .from("goals")
        .select("title, target_value, current_value, status")
        .eq("user_id", userId)
        .limit(10),
      supabase
        .from("travel_records")
        .select("mode, distance_km, trips_per_week")
        .eq("user_id", userId)
        .limit(10),
    ]);

    const calcs = calcRes.data ?? [];
    const snapshot: Snapshot = {
      hasData: calcs.length > 0,
      latest: calcs[0] ?? null,
      history: calcs.map((c) => ({ total_kg: Number(c.total_kg), created_at: c.created_at })),
      goals: (goalRes.data ?? []).map((g) => ({
        title: g.title,
        target_value: Number(g.target_value),
        current_value: Number(g.current_value),
        status: g.status,
      })),
      travel: (travelRes.data ?? []).map((t) => ({
        mode: t.mode,
        distance_km: Number(t.distance_km),
        trips_per_week: t.trips_per_week,
      })),
    };

    const system = [
      "You are the EcoTrack AI Coach, a campus sustainability assistant.",
      "You may ONLY reason about the user data provided in the DATA block below.",
      "Never invent numbers, activities, locations or history that are not in DATA.",
      "If DATA is missing what a question needs, say exactly which data the user must add (e.g. run the Carbon Calculator, add a travel record).",
      "Always describe figures as estimated CO2e, never as exact measurements.",
      "Be concise, practical and specific to Indian campus life. Prefer 3-5 short bullet points with expected estimated savings in kg CO2e where the data supports it.",
      `DATA: ${JSON.stringify(snapshot)}`,
    ].join("\n");

    const lovable = createOpenAI({
      baseURL: "https://ai.gateway.lovable.dev/v1",
      apiKey,
      headers: {
        "Lovable-API-Key": apiKey,
        "X-Lovable-AIG-SDK": "vercel-ai-sdk",
      },
    });

    try {
      const result = streamText({
        model: lovable.responses("openai/gpt-5.6-sol"),
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
