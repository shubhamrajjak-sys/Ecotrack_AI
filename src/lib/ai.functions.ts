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
 * Intelligent local fallback analyzer that reasons about user data
 * when AI API keys are not set or when external AI credits expire.
 */
function generateLocalCoachAdvice(
  question: string,
  snapshot: z.infer<typeof SnapshotInput>,
): string {
  const latest = snapshot.latest;
  if (!snapshot.hasData || !latest) {
    return [
      "🌱 **Welcome to EcoTrack AI Coach!**",
      "",
      "I don't see any logged carbon calculations in your profile yet.",
      "To get tailored recommendations grounded in your campus footprint:",
      "1. Go to the **Calculator** tab and log your monthly transport, energy, food, and waste.",
      "2. Add your daily/weekly commute records in **Travel Logs**.",
      "3. Set a reduction target under **Goals**.",
      "",
      "Once you log your data, I will provide precise insights into your biggest emission sources and actionable ways to save kg CO2e!",
    ].join("\n");
  }

  const q = question.toLowerCase();
  const { total_kg, transport_kg, energy_kg, food_kg, waste_kg } = latest;

  const categories = [
    {
      name: "Transport & Commute",
      short: "transport",
      kg: transport_kg,
      tip: "Carpool with peers, switch 2 weekly trips to campus bus or cycling (estimated saving: ~15–30 kg CO2e/month).",
    },
    {
      name: "Energy & Electricity",
      short: "energy",
      kg: energy_kg,
      tip: "Switch off AC when away from hostel/room, use natural daylight, and unplug idle adapters (estimated saving: ~10–25 kg CO2e/month).",
    },
    {
      name: "Food & Cafeteria",
      short: "food",
      kg: food_kg,
      tip: "Opt for plant-forward meals at the campus cafeteria and minimize food waste (estimated saving: ~8–20 kg CO2e/month).",
    },
    {
      name: "Waste Management",
      short: "waste",
      kg: waste_kg,
      tip: "Carry a reusable bottle and segregate wet/dry recyclables on campus (estimated saving: ~3–8 kg CO2e/month).",
    },
  ].sort((a, b) => b.kg - a.kg);

  const biggest = categories[0];
  const total = total_kg || 1;
  const pct = Math.round((biggest.kg / total) * 100);

  if (q.includes("biggest") || q.includes("highest") || q.includes("source") || q.includes("why")) {
    return [
      `📊 **Your Biggest Emission Source: ${biggest.name}**`,
      "",
      `• **Estimated Footprint**: **${biggest.kg.toFixed(1)} kg CO2e** (about **${pct}%** of your total **${total_kg.toFixed(1)} kg CO2e**).`,
      `• **Key Insight**: ${biggest.tip}`,
      `• **Actionable Next Steps**:`,
      `  - Review your **${biggest.short}** entries to identify peak activity days.`,
      `  - Set a 10–15% reduction target for next month under the **Goals** tab.`,
      `  - Explore shared transit or energy conservation alternatives on campus.`,
    ].join("\n");
  }

  if (q.includes("commute") || q.includes("travel") || q.includes("transport")) {
    const travelItems = snapshot.travel || [];
    const travelSummary =
      travelItems.length > 0
        ? travelItems
            .map(
              (t) =>
                `  - *${t.mode}*: ${t.distance_km} km (${t.trips_per_week} trips/week)`,
            )
            .join("\n")
        : "";

    return [
      "🚲 **Commute & Transport Reduction Strategy**",
      "",
      `• Current transport footprint: **${transport_kg.toFixed(1)} kg CO2e/month** (${Math.round((transport_kg / total) * 100)}% of total).`,
      travelSummary ? `• Logged travel patterns:\n${travelSummary}\n` : "",
      "• **Recommendations for Campus Life**:",
      "  - **Campus Carpooling / Rideshare**: Sharing rides for campus commutes cuts per-person emissions by ~40–50% (estimated saving: **15–25 kg CO2e/month**).",
      "  - **Campus E-Bikes / Cycling**: Replace short auto/cab rides under 3 km with walking or cycling (estimated saving: **10–18 kg CO2e/month**).",
      "  - **Batching Trips**: Combine weekend grocery or library errands into single trips.",
    ]
      .filter(Boolean)
      .join("\n");
  }

  if (q.includes("goal") || q.includes("target")) {
    const targetSaving = (total_kg * 0.15).toFixed(1);
    return [
      "🎯 **Recommended Realistic Reduction Goal**",
      "",
      `Based on your current monthly footprint of **${total_kg.toFixed(1)} kg CO2e**, a realistic 15% reduction target is:`,
      "",
      `• **Target Reduction**: Save **${targetSaving} kg CO2e** next month.`,
      `• **Primary Focus (${biggest.name})**: Target saving ~${(biggest.kg * 0.2).toFixed(1)} kg CO2e by ${biggest.tip.toLowerCase()}`,
      `• **Secondary Focus (${categories[1].name})**: Target ${categories[1].short} reduction through small daily habit changes.`,
      "",
      "You can add this target right now in your **Goals** tab to track your progress!",
    ].join("\n");
  }

  if (q.includes("calculate") || q.includes("how") || q.includes("formula")) {
    return [
      "📐 **How Your Carbon Footprint is Calculated**",
      "",
      "EcoTrack AI computes emissions using standard Tier-1 emission factors adapted for Indian institutional & campus contexts:",
      "",
      `• **Total (${total_kg.toFixed(1)} kg CO2e)** = Transport + Energy + Food + Waste`,
      `  - **Transport (${transport_kg.toFixed(1)} kg CO2e)**: Distance (km) × Vehicle Factor (e.g. 0.12 kg/km for petrol car, 0.03 kg/km for bus)`,
      `  - **Energy (${energy_kg.toFixed(1)} kg CO2e)**: kWh consumed × Grid emission factor (~0.71 kg CO2e/kWh)`,
      `  - **Food (${food_kg.toFixed(1)} kg CO2e)**: Meal types & frequency × diet emission weights`,
      `  - **Waste (${waste_kg.toFixed(1)} kg CO2e)**: Non-recycled solid waste volume × landfill decomposition factor`,
    ].join("\n");
  }

  // General response
  return [
    `🌿 **EcoTrack AI Sustainability Breakdown**`,
    "",
    `Your estimated monthly footprint is **${total_kg.toFixed(1)} kg CO2e**. Here is how it breaks down:`,
    "",
    `1. **${categories[0].name}**: ${categories[0].kg.toFixed(1)} kg CO2e (${Math.round((categories[0].kg / total) * 100)}%) — *Top priority*`,
    `   → *Recommendation*: ${categories[0].tip}`,
    `2. **${categories[1].name}**: ${categories[1].kg.toFixed(1)} kg CO2e (${Math.round((categories[1].kg / total) * 100)}%)`,
    `   → *Recommendation*: ${categories[1].tip}`,
    `3. **${categories[2].name}**: ${categories[2].kg.toFixed(1)} kg CO2e (${Math.round((categories[2].kg / total) * 100)}%)`,
    `4. **${categories[3].name}**: ${categories[3].kg.toFixed(1)} kg CO2e (${Math.round((categories[3].kg / total) * 100)}%)`,
    "",
    "💡 *Tip*: Pick 1–2 small habits from your top category to start seeing measurable reductions in your next calculation!",
  ].join("\n");
}

/**
 * AI Sustainability Coach. Runs server-side only; the model only sees the local
 * data the browser sends with the request, and it is explicitly told not to invent data.
 */
export const coachChat = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ChatInput.parse(input))
  .handler(async ({ data }) => {
    const snapshot = data.snapshot;
    const latestUserMsg =
      [...data.messages].reverse().find((m) => m.role === "user")?.content || "";

    const sustainabilityKeywords = [
      "carbon",
      "co2",
      "emission",
      "emissions",
      "sustainability",
      "sustainable",
      "environment",
      "climate",
      "energy",
      "electricity",
      "power",
      "transport",
      "travel",
      "commute",
      "vehicle",
      "bus",
      "train",
      "bike",
      "bicycle",
      "fuel",
      "petrol",
      "diesel",
      "food",
      "diet",
      "waste",
      "recycle",
      "recycling",
      "water",
      "plastic",
      "paper",
      "eco",
      "ecological",
      "green",
      "goal",
      "footprint",
      "reduce",
      "reduction",
      "saving",
      "savings",
      "campus",
      "environmental",
      "renewable",
      "solar",
    ];

    const question = latestUserMsg.toLowerCase();

    const isSustainabilityQuestion = sustainabilityKeywords.some((keyword) =>
      question.includes(keyword),
    );

    if (!isSustainabilityQuestion) {
      return {
        ok: true as const,
        text: "I'm the EcoTrack AI Coach. I can only help with carbon emissions, sustainability goals, travel, energy, food, waste, and other EcoTrack-related topics. Please ask a sustainability-related question.",
      };
    }

    const apiKey =
      process.env["OPENAI_API_KEY"] ||
      process.env["GROQ_API_KEY"] ||
      process.env["OPENROUTER_API_KEY"] ||
      process.env["VITE_OPENAI_API_KEY"];

    const isGroq = !process.env["OPENAI_API_KEY"] && !!process.env["GROQ_API_KEY"];
    const isOpenRouter = !process.env["OPENAI_API_KEY"] && !!process.env["OPENROUTER_API_KEY"];

    const baseURL =
      process.env["OPENAI_BASE_URL"] ||
      (isGroq
        ? "https://api.groq.com/openai/v1"
        : isOpenRouter
          ? "https://openrouter.ai/api/v1"
          : undefined);

    const modelName =
      process.env["OPENAI_MODEL"] ||
      (isGroq
        ? "llama-3.3-70b-versatile"
        : isOpenRouter
          ? "meta-llama/llama-3.3-70b-instruct:free"
          : "gpt-4o-mini");

    if (!apiKey || apiKey.trim() === "" || apiKey === "your-openai-api-key") {
      // Fallback to local intelligent campus carbon reasoning engine
      return {
        ok: true as const,
        text: generateLocalCoachAdvice(latestUserMsg, snapshot),
      };
    }

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
      baseURL,
    });

    try {
      const result = await generateText({
        model: openai(modelName),
        system,
        messages: data.messages,
      });

      const text = result.text;
      return {
        ok: true as const,
        text:
          text?.trim() ||
          generateLocalCoachAdvice(latestUserMsg, snapshot),
      };
    } catch (error) {
      console.warn("AI gateway error, falling back to local coach engine:", error);
      // If external credits/rate-limits fail, provide smart local advice instead of breaking UI
      return {
        ok: true as const,
        text: generateLocalCoachAdvice(latestUserMsg, snapshot),
      };
    }
  });
