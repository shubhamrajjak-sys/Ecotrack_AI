/**
 * EcoTrack AI — shared carbon domain types & the calculation engine contract.
 *
 * Rule: emission factors are NEVER hardcoded in UI components. They are loaded
 * from the `emission_factors` table and passed into these pure functions.
 */

export type TransportMode =
  | "walking"
  | "bicycle"
  | "bus"
  | "train"
  | "two_wheeler"
  | "car"
  | "auto";

export const TRANSPORT_MODES: { key: TransportMode; label: string; icon: string }[] = [
  { key: "walking", label: "Walking", icon: "🚶" },
  { key: "bicycle", label: "Bicycle", icon: "🚲" },
  { key: "bus", label: "Bus", icon: "🚌" },
  { key: "train", label: "Train / Metro", icon: "🚆" },
  { key: "two_wheeler", label: "Two-wheeler", icon: "🛵" },
  { key: "car", label: "Car", icon: "🚗" },
  { key: "auto", label: "Auto", icon: "🛺" },
];

export const FOOD_PREFERENCES = [
  { key: "vegan", label: "Vegan" },
  { key: "vegetarian", label: "Vegetarian" },
  { key: "mixed", label: "Mixed" },
  { key: "high_meat", label: "High meat" },
] as const;

export const WASTE_STREAMS = [
  { key: "landfill", label: "General / landfill" },
  { key: "recycled", label: "Recycled" },
  { key: "compost", label: "Composted" },
] as const;

export type EmissionFactor = {
  id: string;
  category: string;
  key: string;
  label: string;
  factor: number;
  unit: string;
  source: string;
  methodology: string | null;
};

export type FactorIndex = Record<string, EmissionFactor>;

export function indexFactors(rows: EmissionFactor[]): FactorIndex {
  const out: FactorIndex = {};
  for (const row of rows) out[`${row.category}:${row.key}`] = row;
  return out;
}

export function factorValue(index: FactorIndex, category: string, key: string): number {
  return index[`${category}:${key}`]?.factor ?? 0;
}

export type CalculatorInput = {
  transport: { mode: TransportMode; distanceKm: number; tripsPerWeek: number }[];
  energy: { monthlyKwh: number };
  food: { mealsPerDay: number; preference: string };
  waste: { kgPerWeek: number; stream: string };
};

export type CarbonBreakdown = {
  transportKg: number;
  energyKg: number;
  foodKg: number;
  wasteKg: number;
  totalKg: number;
};

const WEEKS_PER_MONTH = 4.345;
const DAYS_PER_MONTH = 30.44;

/** Activity x emission factor = estimated CO2e, normalised to a monthly figure. */
export function calculateFootprint(
  input: CalculatorInput,
  factors: FactorIndex,
): CarbonBreakdown {
  const transportKg = input.transport.reduce((sum, leg) => {
    const f = factorValue(factors, "transport", leg.mode);
    return sum + f * leg.distanceKm * leg.tripsPerWeek * WEEKS_PER_MONTH;
  }, 0);

  const energyKg = factorValue(factors, "energy", "grid_electricity") * input.energy.monthlyKwh;

  const foodKg =
    factorValue(factors, "food", input.food.preference) * input.food.mealsPerDay * DAYS_PER_MONTH;

  const wasteKg = factorValue(factors, "waste", input.waste.stream) * input.waste.kgPerWeek * WEEKS_PER_MONTH;

  const round = (n: number) => Math.round(n * 10) / 10;
  const total = transportKg + energyKg + foodKg + wasteKg;

  return {
    transportKg: round(transportKg),
    energyKg: round(energyKg),
    foodKg: round(foodKg),
    wasteKg: round(wasteKg),
    totalKg: round(total),
  };
}

export function biggestSource(b: CarbonBreakdown): { key: string; label: string; value: number } {
  const entries = [
    { key: "transport", label: "Transportation", value: b.transportKg },
    { key: "energy", label: "Energy", value: b.energyKg },
    { key: "food", label: "Food", value: b.foodKg },
    { key: "waste", label: "Waste", value: b.wasteKg },
  ];
  return entries.sort((a, z) => z.value - a.value)[0]!;
}

export const CATEGORY_META: Record<string, { label: string; color: string }> = {
  transport: { label: "Transportation", color: "var(--chart-1)" },
  energy: { label: "Energy", color: "var(--chart-4)" },
  food: { label: "Food", color: "var(--chart-2)" },
  waste: { label: "Waste", color: "var(--chart-5)" },
};

/** Deterministic sustainability rules; AI adds the explanation layer on top. */
export type RuleRecommendation = {
  title: string;
  body: string;
  category: string;
  impactKg: number;
};

export function ruleRecommendations(b: CarbonBreakdown): RuleRecommendation[] {
  const out: RuleRecommendation[] = [];
  if (b.transportKg > 0) {
    out.push({
      title: "Shift two car/bike trips a week to public transport",
      body: "Transport is a high-leverage category. Replacing short private-vehicle trips with bus, metro or cycling typically removes 30–60% of commute emissions.",
      category: "transport",
      impactKg: Math.round(b.transportKg * 0.35 * 10) / 10,
    });
  }
  if (b.energyKg > 0) {
    out.push({
      title: "Cut standby and cooling load in your room",
      body: "Raising AC setpoint by 2°C, switching to LED lighting and eliminating standby draw usually reduces electricity use by 10–20%.",
      category: "energy",
      impactKg: Math.round(b.energyKg * 0.15 * 10) / 10,
    });
  }
  if (b.foodKg > 0) {
    out.push({
      title: "Swap 5 meals a week for plant-forward options",
      body: "Lifecycle emissions of plant-based meals are substantially lower than meat-heavy meals in mess and canteen settings.",
      category: "food",
      impactKg: Math.round(b.foodKg * 0.18 * 10) / 10,
    });
  }
  if (b.wasteKg > 0) {
    out.push({
      title: "Segregate dry waste and compost organics",
      body: "Diverting organic waste from landfill avoids methane generation, the dominant emission pathway for campus waste.",
      category: "waste",
      impactKg: Math.round(b.wasteKg * 0.4 * 10) / 10,
    });
  }
  return out.sort((a, z) => z.impactKg - a.impactKg).slice(0, 4);
}

export const BADGES = [
  { code: "green_starter", label: "Green Starter", emoji: "🌱", hint: "Complete your first footprint calculation" },
  { code: "green_commuter", label: "Green Commuter", emoji: "🚲", hint: "Log a walking, cycling or transit trip" },
  { code: "energy_saver", label: "Energy Saver", emoji: "⚡", hint: "Complete an energy reduction goal" },
  { code: "waste_reducer", label: "Waste Reducer", emoji: "♻️", hint: "Complete a waste reduction goal" },
  { code: "eco_champion", label: "Eco Champion", emoji: "🏆", hint: "Reach 500 eco points" },
];
