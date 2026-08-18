import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { Check, Loader2, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { AppShell, PageHeading } from "@/components/eco/AppShell";
import { ScoreRing } from "@/components/eco/ScoreRing";
import { LiftCard, ProgressBar } from "@/components/eco/motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

import {
  CATEGORY_META,
  FOOD_PREFERENCES,
  TRANSPORT_MODES,
  WASTE_STREAMS,
  calculateFootprint,
  type CalculatorInput,
  type TransportMode,
} from "@/lib/carbon";
import { addEcoPoints, awardBadge, factorsQuery, profileQuery } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/calculator")({
  head: () => ({
    meta: [
      { title: "Carbon Calculator — EcoTrack AI" },
      { name: "description", content: "Estimate your monthly CO₂e from transport, energy, food and waste using published emission factors." },
      { property: "og:title", content: "Carbon Calculator — EcoTrack AI" },
      { property: "og:description", content: "A four-step campus carbon footprint calculator with live estimates." },
    ],
  }),
  component: CalculatorPage,
});

const STEPS = ["Transport", "Energy", "Food", "Waste"];

function CalculatorPage() {
  const { user } = useAuth();
  const uid = user?.id ?? "";
  const navigate = useNavigate();
  const qc = useQueryClient();
  const factors = useQuery(factorsQuery);
  const profile = useQuery({ ...profileQuery(uid), enabled: !!uid });

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [input, setInput] = useState<CalculatorInput>({
    transport: [{ mode: "bus", distanceKm: 8, tripsPerWeek: 10 }],
    energy: { monthlyKwh: 120 },
    food: { mealsPerDay: 3, preference: "mixed" },
    waste: { kgPerWeek: 4, stream: "landfill" },
  });

  const breakdown = useMemo(
    () => (factors.data ? calculateFootprint(input, factors.data.index) : null),
    [input, factors.data],
  );

  async function save() {
    if (!uid || !breakdown) return;
    setSaving(true);
    const { error } = await supabase.from("carbon_calculations").insert({
      user_id: uid,
      transport_kg: breakdown.transportKg,
      energy_kg: breakdown.energyKg,
      food_kg: breakdown.foodKg,
      waste_kg: breakdown.wasteKg,
      total_kg: breakdown.totalKg,
      inputs: JSON.parse(JSON.stringify(input)) as Json,
    });

    if (error) {
      setSaving(false);
      toast.error("Could not save calculation", { description: error.message });
      return;
    }

    await supabase.from("travel_records").insert(
      input.transport
        .filter((t) => t.distanceKm > 0 && t.tripsPerWeek > 0)
        .map((t) => ({
          user_id: uid,
          mode: t.mode,
          origin_label: "Home",
          destination_label: "Campus",
          distance_km: t.distanceKm,
          trips_per_week: t.tripsPerWeek,
        })),
    );


    await awardBadge(uid, "green_starter");
    if (input.transport.some((t) => ["walking", "bicycle", "bus", "train"].includes(t.mode))) {
      await awardBadge(uid, "green_commuter");
    }
    await addEcoPoints(uid, profile.data?.eco_points ?? 0, 25);

    await qc.invalidateQueries();
    setSaving(false);
    toast.success("Footprint saved", { description: "+25 eco points earned 🌿" });
    void navigate({ to: "/dashboard" });
  }

  const pct = ((step + 1) / STEPS.length) * 100;

  return (
    <AppShell>
      <PageHeading
        title="Carbon Calculator"
        subtitle="Every figure below is an estimate produced from your inputs and emission factors stored in the platform database."
      />

      {factors.isLoading ? (
        <Skeleton className="h-96 rounded-3xl" />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
          <LiftCard>
            <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <span>
                Step {step + 1} of {STEPS.length}
              </span>
              <span>{STEPS[step]}</span>
            </div>
            <ProgressBar className="mt-3" value={pct} />

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.35 }}
                className="mt-7 space-y-6"
              >
                {step === 0 && (
                  <div className="space-y-4">
                    {input.transport.map((leg, i) => (
                      <div key={i} className="rounded-2xl border border-border/70 bg-card/60 p-4">
                        <div className="flex flex-wrap gap-2">
                          {TRANSPORT_MODES.map((m) => (
                            <button
                              key={m.key}
                              type="button"
                              onClick={() => {
                                const next = [...input.transport];
                                next[i] = { ...leg, mode: m.key as TransportMode };
                                setInput({ ...input, transport: next });
                              }}
                              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                                leg.mode === m.key
                                  ? "border-transparent bg-gradient-primary text-primary-foreground"
                                  : "border-border bg-background/60 text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              {m.icon} {m.label}
                            </button>
                          ))}
                        </div>
                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                          <div className="space-y-1.5">
                            <Label>Distance per trip (km)</Label>
                            <Input
                              type="number"
                              min={0}
                              className="rounded-xl"
                              value={leg.distanceKm}
                              onChange={(e) => {
                                const next = [...input.transport];
                                next[i] = { ...leg, distanceKm: Number(e.target.value) };
                                setInput({ ...input, transport: next });
                              }}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label>Trips per week</Label>
                            <Input
                              type="number"
                              min={0}
                              className="rounded-xl"
                              value={leg.tripsPerWeek}
                              onChange={(e) => {
                                const next = [...input.transport];
                                next[i] = { ...leg, tripsPerWeek: Number(e.target.value) };
                                setInput({ ...input, transport: next });
                              }}
                            />
                          </div>
                        </div>
                        {input.transport.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-3 text-destructive"
                            onClick={() =>
                              setInput({
                                ...input,
                                transport: input.transport.filter((_, x) => x !== i),
                              })
                            }
                          >
                            <Trash2 className="size-4" /> Remove leg
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      onClick={() =>
                        setInput({
                          ...input,
                          transport: [
                            ...input.transport,
                            { mode: "car", distanceKm: 5, tripsPerWeek: 2 },
                          ],
                        })
                      }
                    >
                      <Plus className="size-4" /> Add another commute leg
                    </Button>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-5">
                    <div className="space-y-3">
                      <Label>Monthly electricity use: {input.energy.monthlyKwh} kWh</Label>
                      <Slider
                        value={[input.energy.monthlyKwh]}
                        min={0}
                        max={600}
                        step={5}
                        onValueChange={([v]) =>
                          setInput({ ...input, energy: { monthlyKwh: v ?? 0 } })
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Check your hostel or department meter reading for accuracy. Grid factor is
                        read from the emission factors table.
                      </p>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-5">
                    <div className="space-y-3">
                      <Label>Meals per day: {input.food.mealsPerDay}</Label>
                      <Slider
                        value={[input.food.mealsPerDay]}
                        min={1}
                        max={5}
                        step={1}
                        onValueChange={([v]) =>
                          setInput({ ...input, food: { ...input.food, mealsPerDay: v ?? 1 } })
                        }
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {FOOD_PREFERENCES.map((f) => (
                        <button
                          key={f.key}
                          type="button"
                          onClick={() =>
                            setInput({ ...input, food: { ...input.food, preference: f.key } })
                          }
                          className={`rounded-full border px-4 py-2 text-xs font-medium transition-colors ${
                            input.food.preference === f.key
                              ? "border-transparent bg-gradient-primary text-primary-foreground"
                              : "border-border bg-background/60 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-5">
                    <div className="space-y-3">
                      <Label>Waste generated per week: {input.waste.kgPerWeek} kg</Label>
                      <Slider
                        value={[input.waste.kgPerWeek]}
                        min={0}
                        max={30}
                        step={0.5}
                        onValueChange={([v]) =>
                          setInput({ ...input, waste: { ...input.waste, kgPerWeek: v ?? 0 } })
                        }
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {WASTE_STREAMS.map((w) => (
                        <button
                          key={w.key}
                          type="button"
                          onClick={() =>
                            setInput({ ...input, waste: { ...input.waste, stream: w.key } })
                          }
                          className={`rounded-full border px-4 py-2 text-xs font-medium transition-colors ${
                            input.waste.stream === w.key
                              ? "border-transparent bg-gradient-primary text-primary-foreground"
                              : "border-border bg-background/60 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {w.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 flex justify-between gap-3">
              <Button variant="ghost" disabled={step === 0} onClick={() => setStep(step - 1)}>
                Back
              </Button>
              {step < STEPS.length - 1 ? (
                <Button variant="hero" onClick={() => setStep(step + 1)}>
                  Continue
                </Button>
              ) : (
                <Button variant="hero" onClick={() => void save()} disabled={saving}>
                  {saving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                  Save footprint
                </Button>
              )}
            </div>
          </LiftCard>

          <LiftCard className="h-fit lg:sticky lg:top-8">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Live estimate
            </h3>
            <div className="mt-5 flex justify-center">
              <ScoreRing
                value={breakdown?.totalKg ?? 0}
                max={Math.max((breakdown?.totalKg ?? 0) * 1.4, 200)}
                caption="Estimated monthly CO₂e"
              />
            </div>
            <div className="mt-6 space-y-3">
              {breakdown &&
                (
                  [
                    ["transport", breakdown.transportKg],
                    ["energy", breakdown.energyKg],
                    ["food", breakdown.foodKg],
                    ["waste", breakdown.wasteKg],
                  ] as const
                ).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span
                          className="size-2.5 rounded-full"
                          style={{ background: CATEGORY_META[key]!.color }}
                        />
                        {CATEGORY_META[key]!.label}
                      </span>
                      <span className="font-medium">{value.toFixed(1)} kg</span>
                    </div>
                    <ProgressBar
                      className="mt-1.5"
                      value={breakdown.totalKg ? (value / breakdown.totalKg) * 100 : 0}
                    />
                  </div>
                ))}
            </div>
            <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
              Factors sourced from the platform's emission factor registry. Values are estimates,
              not measurements.
            </p>
          </LiftCard>
        </div>
      )}
    </AppShell>
  );
}
