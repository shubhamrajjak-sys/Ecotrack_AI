/**
 * EcoTrack AI — local, browser-only data store.
 *
 * This project uses a simple name-based local access model: there is no
 * authentication service and no remote database. This module exposes a tiny
 * subset of a query-builder API (`from(...).select().eq().order().limit()`,
 * `insert`, `update`, `rpc`) backed by localStorage, so the existing pages keep
 * working unchanged.
 */

import type { EmissionFactor } from "@/lib/carbon";

const DB_KEY = "ecotrack_local_db_v1";
export const NAME_KEY = "ecotrack_user_name";

export const DEFAULT_FACTORS: EmissionFactor[] = [
  { id: "f-energy-grid", category: "energy", key: "grid_electricity", label: "Grid electricity", factor: 0.716, unit: "kg CO2e/kWh", source: "CEA India CO2 Baseline Database v19", methodology: "National grid average emission factor." },
  { id: "f-food-high", category: "food", key: "high_meat", label: "High meat meal", factor: 3.2, unit: "kg CO2e/meal", source: "Poore & Nemecek (2018), Science", methodology: "Average per-meal lifecycle emissions." },
  { id: "f-food-mixed", category: "food", key: "mixed", label: "Mixed diet meal", factor: 1.65, unit: "kg CO2e/meal", source: "Poore & Nemecek (2018), Science", methodology: "Average per-meal lifecycle emissions." },
  { id: "f-food-vegan", category: "food", key: "vegan", label: "Vegan meal", factor: 0.51, unit: "kg CO2e/meal", source: "Poore & Nemecek (2018), Science", methodology: "Average per-meal lifecycle emissions." },
  { id: "f-food-veg", category: "food", key: "vegetarian", label: "Vegetarian meal", factor: 0.72, unit: "kg CO2e/meal", source: "Poore & Nemecek (2018), Science", methodology: "Average per-meal lifecycle emissions." },
  { id: "f-tr-auto", category: "transport", key: "auto", label: "Auto rickshaw", factor: 0.107, unit: "kg CO2e/km", source: "India GHG Program", methodology: "CNG three-wheeler, average occupancy." },
  { id: "f-tr-bicycle", category: "transport", key: "bicycle", label: "Bicycle", factor: 0, unit: "kg CO2e/km", source: "IPCC AR6 / DEFRA 2023", methodology: "Zero direct operational emissions." },
  { id: "f-tr-bus", category: "transport", key: "bus", label: "Bus", factor: 0.105, unit: "kg CO2e/km", source: "DEFRA 2023 average local bus", methodology: "Per passenger-km, average occupancy." },
  { id: "f-tr-car", category: "transport", key: "car", label: "Car", factor: 0.171, unit: "kg CO2e/km", source: "DEFRA 2023 average car", methodology: "Per vehicle-km, petrol, single occupancy." },
  { id: "f-tr-train", category: "transport", key: "train", label: "Train / Metro", factor: 0.041, unit: "kg CO2e/km", source: "DEFRA 2023 light rail & metro", methodology: "Per passenger-km, grid-average electricity." },
  { id: "f-tr-two", category: "transport", key: "two_wheeler", label: "Two-wheeler", factor: 0.089, unit: "kg CO2e/km", source: "India GHG Program", methodology: "Petrol motorcycle, single rider." },
  { id: "f-tr-walk", category: "transport", key: "walking", label: "Walking", factor: 0, unit: "kg CO2e/km", source: "IPCC AR6 / DEFRA 2023", methodology: "Zero direct operational emissions." },
  { id: "f-w-compost", category: "waste", key: "compost", label: "Composted organic waste", factor: 0.01, unit: "kg CO2e/kg", source: "DEFRA 2023 composting", methodology: "Managed aerobic composting." },
  { id: "f-w-landfill", category: "waste", key: "landfill", label: "Mixed landfill waste", factor: 0.58, unit: "kg CO2e/kg", source: "DEFRA 2023 waste disposal", methodology: "Mixed municipal waste to landfill." },
  { id: "f-w-recycled", category: "waste", key: "recycled", label: "Recycled waste", factor: 0.021, unit: "kg CO2e/kg", source: "DEFRA 2023 closed-loop recycling", methodology: "Processing emissions only." },
];

type Row = Record<string, unknown>;
type Tables = Record<string, Row[]>;

const EMPTY: Tables = {
  profiles: [],
  carbon_calculations: [],
  goals: [],
  travel_records: [],
  achievements: [],
};

function read(): Tables {
  if (typeof window === "undefined") return { ...EMPTY };
  try {
    const raw = window.localStorage.getItem(DB_KEY);
    if (!raw) return { ...EMPTY };
    return { ...EMPTY, ...(JSON.parse(raw) as Tables) };
  } catch {
    return { ...EMPTY };
  }
}

function write(db: Tables) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Stable, deterministic local id derived from the entered name. */
export function localUserId(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return `local-${h.toString(36)}`;
}

export function ensureLocalProfile(userId: string, displayName: string) {
  const db = read();
  const existing = db['profiles']!.find((p) => p['id'] === userId);
  if (existing) {
    if (!existing['display_name']) existing['display_name'] = displayName;
    write(db);
    return;
  }
  db['profiles']!.push({
    id: userId,
    display_name: displayName,
    department: "",
    campus: "",
    role_type: "student",
    reduction_target_pct: 20,
    share_on_leaderboard: true,
    eco_points: 0,
    streak_days: 0,
    onboarded: false,
    created_at: new Date().toISOString(),
  });
  write(db);
}

type Result<T> = { data: T; error: { message: string } | null };

class Query<T = Row[]> implements PromiseLike<Result<T>> {
  private filters: [string, unknown][] = [];
  private orderBy: { col: string; asc: boolean } | null = null;
  private limitTo: number | null = null;
  private single = false;

  constructor(
    private table: string,
    private op: "select" | "insert" | "update",
    private payload?: Row | Row[],
  ) {}

  select(_cols?: string) {
    return this;
  }
  eq(col: string, value: unknown) {
    this.filters.push([col, value]);
    return this;
  }
  order(col: string, opts?: { ascending?: boolean }) {
    this.orderBy = { col, asc: opts?.ascending !== false };
    return this;
  }
  limit(n: number) {
    this.limitTo = n;
    return this;
  }
  maybeSingle() {
    this.single = true;
    return this;
  }

  private run(): Result<unknown> {
    const db = read();
    const rows = (db[this.table] ??= []);

    if (this.op === "insert") {
      const items = Array.isArray(this.payload) ? this.payload : this.payload ? [this.payload] : [];
      for (const item of items) {
        rows.push({ id: uid(), created_at: new Date().toISOString(), status: "active", current_value: 0, ...item });
      }
      write(db);
      return { data: null, error: null };
    }

    const matches = (r: Row) => this.filters.every(([c, v]) => r[c] === v);

    if (this.op === "update") {
      for (const r of rows) if (matches(r)) Object.assign(r, this.payload);
      write(db);
      return { data: null, error: null };
    }

    let out = rows.filter(matches);
    if (this.orderBy) {
      const { col, asc } = this.orderBy;
      out = [...out].sort((a, b) => {
        const av = a[col] as string | number;
        const bv = b[col] as string | number;
        if (av === bv) return 0;
        return (av > bv ? 1 : -1) * (asc ? 1 : -1);
      });
    }
    if (this.limitTo != null) out = out.slice(0, this.limitTo);
    return { data: this.single ? (out[0] ?? null) : out, error: null };
  }

  then<R1 = Result<T>, R2 = never>(
    onfulfilled?: ((value: Result<T>) => R1 | PromiseLike<R1>) | null,
    onrejected?: ((reason: unknown) => R2 | PromiseLike<R2>) | null,
  ): PromiseLike<R1 | R2> {
    return Promise.resolve(this.run() as Result<T>).then(onfulfilled, onrejected);
  }
}

function selectFactors() {
  return DEFAULT_FACTORS;
}

export const localDb = {
  from(table: string) {
    return {
      select: (cols?: string) => new Query(table, "select").select(cols),
      insert: (payload: Row | Row[]) => new Query(table, "insert", payload),
      update: (payload: Row) => new Query(table, "update", payload),
    };
  },
  async rpc(fn: string, args?: Record<string, unknown>) {
    const db = read();
    if (fn === "leaderboard") {
      const limit = Number(args?.['_limit'] ?? 25);
      const rows = db['profiles']!
        .filter((p) => p['share_on_leaderboard'] !== false)
        .map((p) => ({
          user_id: p['id'],
          display_name: p['display_name'],
          department: p['department'],
          eco_points: Number(p['eco_points'] ?? 0),
          streak_days: Number(p['streak_days'] ?? 0),
        }))
        .sort((a, b) => b.eco_points - a.eco_points)
        .slice(0, limit);
      return { data: rows, error: null };
    }
    if (fn === "campus_analytics") {
      const calcs = db['carbon_calculations']!;
      const n = calcs.length || 1;
      const sum = (k: string) => calcs.reduce((s, c) => s + Number(c[k] ?? 0), 0);
      return {
        data: [
          {
            participants: db['profiles']!.length,
            calculations: calcs.length,
            avg_total_kg: sum("total_kg") / n,
            avg_transport_kg: sum("transport_kg") / n,
            avg_energy_kg: sum("energy_kg") / n,
            avg_food_kg: sum("food_kg") / n,
            avg_waste_kg: sum("waste_kg") / n,
          },
        ],
        error: null,
      };
    }
    return { data: null, error: { message: `Unknown local function: ${fn}` } };
  },
  factors: selectFactors,
};

export type ProfileRow = {
  id: string;
  display_name: string | null;
  department: string | null;
  campus: string | null;
  role_type: string;
  reduction_target_pct: number;
  share_on_leaderboard: boolean;
  eco_points: number;
  streak_days: number;
  onboarded: boolean;
  created_at: string;
};

export type CalculationRow = {
  id: string;
  user_id: string;
  transport_kg: number;
  energy_kg: number;
  food_kg: number;
  waste_kg: number;
  total_kg: number;
  inputs: unknown;
  created_at: string;
};

export type GoalRow = {
  id: string;
  user_id: string;
  title: string;
  category: string;
  target_value: number;
  current_value: number;
  unit: string;
  status: string;
  created_at: string;
};

export type TravelRow = {
  id: string;
  user_id: string;
  mode: string;
  origin_label: string;
  destination_label: string;
  distance_km: number;
  trips_per_week: number;
  created_at: string;
};

export type AchievementRow = {
  id: string;
  user_id: string;
  badge_code: string;
  created_at: string;
};
