import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  ArrowRight,
  Bot,
  Calculator,
  Flame,
  Sparkles,
  Target,
  TrendingDown,
  Trophy,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AppShell, PageHeading } from "@/components/eco/AppShell";
import { ScoreRing } from "@/components/eco/ScoreRing";
import { Counter, LiftCard, ProgressBar, Reveal } from "@/components/eco/motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { CATEGORY_META, biggestSource, ruleRecommendations } from "@/lib/carbon";
import { calculationsQuery, goalsQuery, profileQuery } from "@/lib/data";
import { predictNextMonth } from "@/lib/predict";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — EcoTrack AI" },
      { name: "description", content: "Your estimated carbon footprint, trend, biggest emission source and AI recommendations." },
      { property: "og:title", content: "Dashboard — EcoTrack AI" },
      { property: "og:description", content: "Track your estimated campus carbon footprint over time." },
    ],
  }),
  component: Dashboard,
});

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function Dashboard() {
  const { user } = useAuth();
  const uid = user?.id ?? "";

  const profile = useQuery({ ...profileQuery(uid), enabled: !!uid });
  const calcs = useQuery({ ...calculationsQuery(uid), enabled: !!uid });
  const goals = useQuery({ ...goalsQuery(uid), enabled: !!uid });

  const loading = profile.isLoading || calcs.isLoading;
  const latest = calcs.data?.[0];
  const hasData = !!latest;

  const breakdown = latest
    ? {
        transportKg: Number(latest.transport_kg),
        energyKg: Number(latest.energy_kg),
        foodKg: Number(latest.food_kg),
        wasteKg: Number(latest.waste_kg),
        totalKg: Number(latest.total_kg),
      }
    : null;

  const pieData = breakdown
    ? [
        { name: "Transportation", value: breakdown.transportKg, color: CATEGORY_META["transport"]!.color },
        { name: "Energy", value: breakdown.energyKg, color: CATEGORY_META["energy"]!.color },
        { name: "Food", value: breakdown.foodKg, color: CATEGORY_META["food"]!.color },
        { name: "Waste", value: breakdown.wasteKg, color: CATEGORY_META["waste"]!.color },
      ].filter((d) => d.value > 0)
    : [];

  const trend = (calcs.data ?? [])
    .slice()
    .reverse()
    .map((c) => ({
      date: new Date(c.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      total: Number(c.total_kg),
    }));

  const prediction = predictNextMonth((calcs.data ?? []).map((c) => ({ total_kg: Number(c.total_kg) })));
  const top = breakdown ? biggestSource(breakdown) : null;
  const recs = breakdown ? ruleRecommendations(breakdown) : [];
  const activeGoal = goals.data?.find((g) => g.status === "active");
  const target = profile.data?.reduction_target_pct ?? 20;
  const maxScale = breakdown ? Math.max(breakdown.totalKg * 1.4, 200) : 200;

  return (
    <AppShell>
      <PageHeading
        title={
          <>
            {greeting()}, {profile.data?.display_name ?? "there"} 🌱
          </>
        }
        subtitle="All figures are estimated CO₂e derived from your own logged activity and published emission factors."
        action={
          <Button variant="hero" asChild>
            <Link to="/calculator">
              <Calculator className="size-4" /> New calculation
            </Link>
          </Button>
        }
      />

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-3xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Estimated footprint",
              value: breakdown?.totalKg ?? 0,
              suffix: " kg",
              icon: TrendingDown,
              empty: !hasData,
            },
            { label: "Reduction goal", value: target, suffix: "%", icon: Target, empty: false },
            { label: "Eco points", value: profile.data?.eco_points ?? 0, suffix: "", icon: Trophy, empty: false },
            { label: "Current streak", value: profile.data?.streak_days ?? 0, suffix: " days", icon: Flame, empty: false },
          ].map((s, i) => (
            <Reveal key={s.label} delay={i * 0.06}>
              <LiftCard className="h-full">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {s.label}
                  </p>
                  <s.icon className="size-4 text-primary" />
                </div>
                <p className="mt-3 font-display text-3xl font-semibold">
                  {s.empty ? (
                    <span className="text-base font-medium text-muted-foreground">No data yet</span>
                  ) : (
                    <>
                      <Counter value={s.value} decimals={s.suffix === " kg" ? 1 : 0} />
                      <span className="text-base font-medium text-muted-foreground">{s.suffix}</span>
                    </>
                  )}
                </p>
              </LiftCard>
            </Reveal>
          ))}
        </div>
      )}

      {!loading && !hasData && (
        <Reveal>
          <LiftCard className="mt-6 text-center">
            <p className="font-display text-xl font-semibold">No activity data yet</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Complete the carbon calculator to generate your first estimated footprint. EcoTrack AI
              never fills your dashboard with invented numbers.
            </p>
            <Button variant="hero" className="mt-5" asChild>
              <Link to="/calculator">
                Start calculating <ArrowRight className="size-4" />
              </Link>
            </Button>
          </LiftCard>
        </Reveal>
      )}

      {hasData && breakdown && (
        <>
          <div className="mt-6 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <Reveal>
              <LiftCard className="flex h-full flex-col items-center justify-center py-10">
                <ScoreRing
                  value={breakdown.totalKg}
                  max={maxScale}
                  caption={`Latest estimate · ${new Date(latest.created_at).toLocaleDateString()}`}
                />
              </LiftCard>
            </Reveal>

            <Reveal delay={0.08}>
              <LiftCard className="h-full">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Carbon breakdown
                </h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-[180px_1fr] sm:items-center">
                  <div className="h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          innerRadius={48}
                          outerRadius={80}
                          paddingAngle={3}
                          animationDuration={1200}
                        >
                          {pieData.map((d) => (
                            <Cell key={d.name} fill={d.color} stroke="none" />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(v: number) => [`${v.toFixed(1)} kg CO₂e`, ""]}
                          contentStyle={{
                            borderRadius: 16,
                            border: "1px solid var(--border)",
                            background: "var(--card)",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-3">
                    {pieData.map((d) => (
                      <div key={d.name}>
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <span className="size-2.5 rounded-full" style={{ background: d.color }} />
                            {d.name}
                          </span>
                          <span className="font-medium">{d.value.toFixed(1)} kg</span>
                        </div>
                        <ProgressBar className="mt-1.5" value={(d.value / breakdown.totalKg) * 100} />
                      </div>
                    ))}
                  </div>
                </div>
              </LiftCard>
            </Reveal>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <Reveal className="lg:col-span-2">
              <LiftCard className="h-full">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Monthly trend
                </h3>
                {trend.length < 2 ? (
                  <p className="mt-8 text-center text-sm text-muted-foreground">
                    Log at least two calculations to see your trend.
                  </p>
                ) : (
                  <div className="mt-4 h-[240px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trend}>
                        <defs>
                          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                            <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} />
                        <YAxis tickLine={false} axisLine={false} fontSize={12} width={40} />
                        <Tooltip
                          formatter={(v: number) => [`${v.toFixed(1)} kg CO₂e`, "Estimated"]}
                          contentStyle={{
                            borderRadius: 16,
                            border: "1px solid var(--border)",
                            background: "var(--card)",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="total"
                          stroke="var(--chart-1)"
                          strokeWidth={2.5}
                          fill="url(#trendFill)"
                          animationDuration={1400}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
                <div className="mt-4 rounded-2xl border border-border/70 bg-secondary/50 px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Future footprint · {prediction.status === "ready" ? "Model Ready" : "Model Not Configured"}
                  </p>
                  <p className="mt-1 text-sm">
                    {prediction.nextMonthKg !== null
                      ? `Next-month indication: ~${prediction.nextMonthKg} kg CO₂e`
                      : "Not enough history for an indication yet."}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{prediction.note}</p>
                </div>
              </LiftCard>
            </Reveal>

            <Reveal delay={0.08}>
              <div className="grid h-full gap-4">
                <LiftCard>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Biggest emission source
                  </h3>
                  <p className="mt-3 font-display text-2xl font-semibold">{top?.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {top?.value.toFixed(1)} kg CO₂e ·{" "}
                    {((top!.value / breakdown.totalKg) * 100).toFixed(0)}% of your estimate
                  </p>
                </LiftCard>

                <LiftCard>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Current goal
                  </h3>
                  {activeGoal ? (
                    <>
                      <p className="mt-3 font-medium">{activeGoal.title}</p>
                      <ProgressBar
                        className="mt-3"
                        value={(Number(activeGoal.current_value) / Number(activeGoal.target_value)) * 100}
                      />
                      <p className="mt-2 text-xs text-muted-foreground">
                        {Number(activeGoal.current_value)} / {Number(activeGoal.target_value)}{" "}
                        {activeGoal.unit}
                      </p>
                    </>
                  ) : (
                    <div className="mt-3">
                      <p className="text-sm text-muted-foreground">No active goal yet.</p>
                      <Button variant="outline" size="sm" className="mt-3" asChild>
                        <Link to="/goals">Set a goal</Link>
                      </Button>
                    </div>
                  )}
                </LiftCard>
              </div>
            </Reveal>
          </div>

          <Reveal>
            <LiftCard className="mt-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Recommended actions
                </h3>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/coach">
                    <Bot className="size-4" /> Ask the AI Coach
                  </Link>
                </Button>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {recs.map((r, i) => (
                  <motion.div
                    key={r.title}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08, duration: 0.5 }}
                    className="rounded-2xl border border-border/70 bg-card/70 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-semibold">{r.title}</p>
                      <span className="shrink-0 rounded-full bg-accent px-2.5 py-1 text-[11px] font-medium text-accent-foreground">
                        −{r.impactKg} kg
                      </span>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{r.body}</p>
                  </motion.div>
                ))}
              </div>
            </LiftCard>
          </Reveal>

          <Reveal>
            <LiftCard className="mt-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Recent activity
              </h3>
              <ul className="mt-4 divide-y divide-border/70">
                {(calcs.data ?? []).slice(0, 5).map((c) => (
                  <li key={c.id} className="flex items-center justify-between py-3 text-sm">
                    <span className="flex items-center gap-2.5">
                      <Sparkles className="size-4 text-primary" />
                      Footprint calculation
                    </span>
                    <span className="text-muted-foreground">
                      {Number(c.total_kg).toFixed(1)} kg ·{" "}
                      {new Date(c.created_at).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            </LiftCard>
          </Reveal>
        </>
      )}
    </AppShell>
  );
}
