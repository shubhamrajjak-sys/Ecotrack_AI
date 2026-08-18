import { createFileRoute } from "@tanstack/react-router";

import { SiteFooter } from "@/components/eco/SiteFooter";
import { SiteHeader } from "@/components/eco/SiteHeader";
import { LiftCard, Reveal } from "@/components/eco/motion";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy & Data Protection — EcoTrack AI" },
      { name: "description", content: "How EcoTrack AI stores, isolates and shares your campus carbon data — and the controls you have." },
      { property: "og:title", content: "Privacy & Data Protection — EcoTrack AI" },
      { property: "og:description", content: "Row-level security, opt-in sharing and anonymised analytics." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Privacy,
});

const SECTIONS = [
  {
    title: "What we store",
    body: "Your profile details, the activity inputs you submit to the calculator, the resulting estimated footprints, travel records, goals and achievements. Nothing else is collected from your device.",
  },
  {
    title: "Who can read it",
    body: "Row-level security policies restrict every record to its owner. Server functions execute as the signed-in user, so one account can never read another account's footprint data.",
  },
  {
    title: "Leaderboard and analytics",
    body: "Leaderboard visibility is opt-in and shows only your display name, department, eco points and streak. Campus analytics are aggregated averages across participants — individual footprints are never exposed.",
  },
  {
    title: "AI processing",
    body: "When you use the AI Coach, a snapshot of your own carbon data is sent server-side to the AI provider to answer your question. It is not used to identify you, and the coach is instructed never to invent data.",
  },
  {
    title: "Your controls",
    body: "You can edit your profile, change your reduction target, or turn off leaderboard sharing at any time from Profile & Settings.",
  },
];

function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-hero">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 pb-24 pt-28 sm:px-6">
        <Reveal>
          <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Privacy & data protection
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            Carbon data is personal data. EcoTrack AI is designed so that your records stay yours.
          </p>
        </Reveal>

        <div className="mt-10 space-y-4">
          {SECTIONS.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.05}>
              <LiftCard>
                <h2 className="font-display text-lg font-semibold">{s.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </LiftCard>
            </Reveal>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
