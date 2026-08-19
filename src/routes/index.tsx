import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  ArrowRight,
  BarChart3,
  Bike,
  Bot,
  Brain,
  Flame,
  Leaf,
  LineChart,
  LogOut,
  MapPin,
  Recycle,
  Sparkles,
  Target,
  Trophy,
  UtensilsCrossed,
  Zap,
} from "lucide-react";

import { ParticleField } from "@/components/eco/ParticleField";
import { SiteFooter } from "@/components/eco/SiteFooter";
import { SiteHeader } from "@/components/eco/SiteHeader";
import { Counter, LiftCard, Reveal, useMotionOk } from "@/components/eco/motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EcoTrack AI — Measure. Understand. Reduce." },
      {
        name: "description",
        content:
          "AI-powered campus carbon intelligence. Turn real travel, energy, food and waste activity into estimated CO2e insights, personalised recommendations and reduction goals.",
      },
      { property: "og:title", content: "EcoTrack AI — Measure. Understand. Reduce." },
      {
        property: "og:description",
        content:
          "Turn real campus activity into estimated carbon insights, AI coaching and measurable reduction goals.",
      },
    ],
  }),
  component: Landing,
});

const PIPELINE = [
  { label: "Location", icon: MapPin },
  { label: "Activity", icon: Bike },
  { label: "Carbon", icon: Leaf },
  { label: "AI", icon: Brain },
  { label: "Action", icon: Target },
];

const FLOATING_STATS = [
  { label: "Transport", icon: Bike, hint: "Route-based distance" },
  { label: "Energy", icon: Zap, hint: "kWh from your bill" },
  { label: "Food", icon: UtensilsCrossed, hint: "Meals per day" },
  { label: "Waste", icon: Recycle, hint: "Segregation habits" },
];

const STEPS = [
  { n: "01", title: "Collect", body: "Real travel, energy, food and waste inputs — from you, not from guesses." },
  { n: "02", title: "Calculate", body: "Activity × published emission factor = estimated CO₂e, fully sourced." },
  { n: "03", title: "Analyze", body: "See which category dominates your footprint and how it trends." },
  { n: "04", title: "Recommend", body: "Deterministic sustainability rules explained by the AI coach." },
  { n: "05", title: "Improve", body: "Set goals, track streaks, and measure real reduction over time." },
];

const FEATURES = [
  { icon: MapPin, title: "Real Location-Based Travel", body: "Browser geolocation with explicit consent plus a routing provider for actual road distance." },
  { icon: Leaf, title: "Carbon Footprint Calculation", body: "A configurable factor database drives every estimate — nothing hardcoded in the UI." },
  { icon: Bot, title: "AI Sustainability Coach", body: "Context-aware guidance grounded strictly in your own stored activity data." },
  { icon: LineChart, title: "Future Footprint Prediction", body: "Regression service contract with an honest 'Model Not Configured' state." },
  { icon: Sparkles, title: "Personalised Recommendations", body: "Ranked by relevance and estimated impact in kg CO₂e." },
  { icon: Target, title: "Goals & Challenges", body: "Targets, deadlines, animated progress and achievement badges." },
  { icon: BarChart3, title: "Campus Analytics", body: "Aggregated, anonymised emissions across departments and categories." },
  { icon: Trophy, title: "Sustainability Leaderboard", body: "Privacy-friendly display names with opt-out control." },
];

function Landing() {
  const ok = useMotionOk();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const handleSignOut = () => {
    signOut();
    void navigate({ to: "/auth", replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-hero pb-24 pt-32 sm:pt-40">
        <ParticleField count={16} dense />
        <div className="relative mx-auto grid max-w-6xl gap-14 px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="glass-panel inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-muted-foreground"
            >
              <Sparkles className="size-3.5 text-primary" />
              Campus carbon intelligence · AVINYA 2026
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
              className="mt-6 font-display text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl"
            >
              Measure.
              <br />
              Understand.
              <br />
              <span className="text-gradient-eco">Reduce.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
            >
              EcoTrack AI transforms everyday campus activities into actionable carbon insights
              using real-world data and AI.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="mt-9 flex flex-wrap gap-3"
            >
              <Button variant="hero" size="xl" asChild>
                <Link to="/calculator">
                  Calculate My Footprint <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button variant="glass" size="xl" asChild>
                <Link to="/dashboard">Explore Dashboard</Link>
              </Button>
              {user && (
                <Button variant="ghost" size="xl" onClick={handleSignOut}>
                  <LogOut className="size-4" /> Sign Out
                </Button>
              )}
            </motion.div>

            <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {FLOATING_STATS.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 + i * 0.08, duration: 0.6 }}
                >
                  <motion.div
                    animate={ok ? { y: [0, -7, 0] } : {}}
                    transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut" }}
                    className="glass-panel rounded-2xl px-4 py-3.5"
                  >
                    <s.icon className="size-4 text-primary" />
                    <p className="mt-2 text-sm font-semibold">{s.label}</p>
                    <p className="text-[11px] text-muted-foreground">{s.hint}</p>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Animated pipeline visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="glass-panel relative rounded-[28px] p-8"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              How your data flows
            </p>
            <div className="mt-7 space-y-3">
              {PIPELINE.map((p, i) => (
                <motion.div
                  key={p.label}
                  initial={{ opacity: 0, x: -18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.14, duration: 0.55 }}
                  className="relative flex items-center gap-4 rounded-2xl border border-border/60 bg-card/70 px-4 py-3.5"
                >
                  <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground">
                    <p.icon className="size-4.5" />
                  </span>
                  <span className="font-medium">{p.label}</span>
                  {i < PIPELINE.length - 1 && (
                    <motion.span
                      className="absolute -bottom-3 left-9 h-3 w-px bg-border"
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ delay: 0.5 + i * 0.14 }}
                    />
                  )}
                </motion.div>
              ))}
            </div>
            <div className="mt-7 rounded-2xl bg-gradient-mint p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-primary">
                Estimated output
              </p>
              <p className="mt-1 font-display text-3xl font-semibold">
                <Counter value={100} decimals={0} suffix="%" /> traceable
              </p>
              <p className="mt-1 text-xs text-foreground/70">
                Every number links back to a published emission factor.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            How it works
          </p>
          <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Five steps from raw campus activity to measurable reduction
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-4 md:grid-cols-3 lg:grid-cols-5">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.08}>
              <LiftCard className="h-full">
                <span className="font-display text-sm font-semibold text-primary">{s.n}</span>
                <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </LiftCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="relative overflow-hidden bg-secondary/40 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Platform
            </p>
            <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Everything you need to run carbon intelligence on campus
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={(i % 4) * 0.07}>
                <LiftCard className="h-full bg-card/80">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-accent text-primary">
                    <f.icon className="size-5" />
                  </span>
                  <h3 className="mt-4 text-base font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
                </LiftCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* WHY */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <Reveal>
          <div className="glass-panel overflow-hidden rounded-[28px] p-10 sm:p-14">
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-5xl">
              Not just a carbon calculator.
            </h2>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              EcoTrack AI closes the loop between measurement and behaviour change — with an
              architecture built for real data sources, not demo numbers.
            </p>

            <div className="mt-10 grid gap-3 sm:grid-cols-4">
              {[
                { label: "Calculate", icon: Leaf },
                { label: "Predict", icon: LineChart },
                { label: "Recommend", icon: Sparkles },
                { label: "Track", icon: Flame },
              ].map((item, i) => (
                <Reveal key={item.label} delay={i * 0.1}>
                  <div className="rounded-2xl border border-border/70 bg-card/70 px-5 py-6">
                    <item.icon className="size-5 text-primary" />
                    <p className="mt-3 font-display text-lg font-semibold">{item.label}</p>
                  </div>
                </Reveal>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              <Button variant="hero" size="lg" asChild>
                <Link to="/auth">
                  Create your account <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button variant="glass" size="lg" asChild>
                <Link to="/architecture">View system architecture</Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </section>

      <SiteFooter />
    </div>
  );
}
