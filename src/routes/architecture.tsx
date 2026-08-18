import { createFileRoute } from "@tanstack/react-router";
import { Brain, Database, Layers, Lock, Route as RouteIcon, Server } from "lucide-react";

import { SiteFooter } from "@/components/eco/SiteFooter";
import { SiteHeader } from "@/components/eco/SiteHeader";
import { LiftCard, Reveal } from "@/components/eco/motion";

export const Route = createFileRoute("/architecture")({
  head: () => ({
    meta: [
      { title: "System Architecture — EcoTrack AI" },
      { name: "description", content: "How EcoTrack AI is built: React front end, server functions, Postgres with row-level security, AI coach and ML forecast service." },
      { property: "og:title", content: "System Architecture — EcoTrack AI" },
      { property: "og:description", content: "The layered architecture behind campus carbon intelligence." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Architecture,
});

const LAYERS = [
  { icon: Layers, title: "Presentation layer", body: "React 19 with TanStack Router, Tailwind design tokens and Framer Motion animation primitives. All colours, gradients and shadows come from the semantic design system." },
  { icon: Server, title: "Application layer", body: "Typed server functions handle AI orchestration and routing lookups. Secrets never reach the browser; the client only calls RPC endpoints." },
  { icon: Database, title: "Data layer", body: "PostgreSQL with profiles, emission factors, calculations, travel records, goals, achievements and recommendations. Aggregations run in database functions." },
  { icon: Lock, title: "Security layer", body: "Row-level security on every table, role checks through a dedicated user_roles table and a security-definer has_role function to prevent privilege escalation." },
  { icon: Brain, title: "Intelligence layer", body: "Rule-based recommendation engine ranked by estimated impact, plus an AI coach constrained to the signed-in user's own data snapshot." },
  { icon: RouteIcon, title: "Integration layer", body: "Distance lookups via a routing provider and forecasting via an external ML service. Both report Not Configured rather than fabricating results when unavailable." },
];

function Architecture() {
  return (
    <div className="min-h-screen bg-gradient-hero">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 pb-24 pt-28 sm:px-6">
        <Reveal>
          <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            System architecture
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            EcoTrack AI is a layered application: a motion-rich client, a typed server boundary, a
            secured relational core and clearly-bounded intelligence services.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {LAYERS.map((l, i) => (
            <Reveal key={l.title} delay={i * 0.05}>
              <LiftCard className="h-full">
                <l.icon className="size-5 text-primary" />
                <h2 className="mt-4 font-display text-lg font-semibold">{l.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{l.body}</p>
              </LiftCard>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <LiftCard className="mt-6">
            <h2 className="font-display text-lg font-semibold">Data flow</h2>
            <pre className="mt-4 overflow-x-auto rounded-2xl bg-secondary/60 p-4 text-xs leading-relaxed text-muted-foreground">
{`User activity input
   -> Calculation engine (activity x emission factor)
   -> carbon_calculations + travel_records (RLS scoped to owner)
   -> Dashboard aggregation & rule-based recommendations
   -> AI Coach (server function, user-scoped data snapshot)
   -> Campus analytics (anonymised aggregate function)`}
            </pre>
          </LiftCard>
        </Reveal>
      </main>
      <SiteFooter />
    </div>
  );
}
