import { createFileRoute } from "@tanstack/react-router";
import { Leaf, LineChart, ShieldCheck, Sparkles } from "lucide-react";

import { SiteFooter } from "@/components/eco/SiteFooter";
import { SiteHeader } from "@/components/eco/SiteHeader";
import { LiftCard, Reveal } from "@/components/eco/motion";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About EcoTrack AI — Campus Carbon Intelligence" },
      { name: "description", content: "EcoTrack AI helps students and faculty measure, understand and reduce their estimated campus carbon footprint." },
      { property: "og:title", content: "About EcoTrack AI" },
      { property: "og:description", content: "Why we built a transparent, data-honest campus carbon platform." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: About,
});

const PILLARS = [
  { icon: LineChart, title: "Measure honestly", body: "Every number is an estimate derived from your own logged activity and documented emission factors — never a placeholder." },
  { icon: Sparkles, title: "Understand deeply", body: "The AI coach explains what drives your footprint using only the data you provided, and says so when data is missing." },
  { icon: Leaf, title: "Act meaningfully", body: "Recommendations are ranked by estimated impact, so you spend effort where it actually reduces emissions." },
  { icon: ShieldCheck, title: "Stay in control", body: "Row-level security isolates your records. Leaderboard participation and analytics sharing are opt-in." },
];

function About() {
  return (
    <div className="min-h-screen bg-gradient-hero">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 pb-24 pt-28 sm:px-6">
        <Reveal>
          <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Campus carbon intelligence, without the guesswork
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            EcoTrack AI was built for university communities that want to move past vague
            sustainability pledges. It turns everyday campus activity — commuting, electricity,
            meals and waste — into an estimated CO₂e footprint you can actually act on.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {PILLARS.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.06}>
              <LiftCard className="h-full">
                <p.icon className="size-5 text-primary" />
                <h2 className="mt-4 font-display text-lg font-semibold">{p.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
              </LiftCard>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <LiftCard className="mt-6">
            <h2 className="font-display text-xl font-semibold">Our data principle</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              A carbon platform loses its value the moment it invents numbers. EcoTrack AI shows
              empty states instead of fabricated charts, labels every figure as an estimate, and
              marks unavailable services — such as the machine-learning forecast model or route
              distance provider — as "Not Configured" rather than faking output.
            </p>
          </LiftCard>
        </Reveal>
      </main>
      <SiteFooter />
    </div>
  );
}
