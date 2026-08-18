import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { SiteFooter } from "@/components/eco/SiteFooter";
import { SiteHeader } from "@/components/eco/SiteHeader";
import { LiftCard, Reveal } from "@/components/eco/motion";
import { Skeleton } from "@/components/ui/skeleton";
import { CATEGORY_META } from "@/lib/carbon";
import { factorsQuery } from "@/lib/data";

export const Route = createFileRoute("/methodology")({
  head: () => ({
    meta: [
      { title: "Methodology & Emission Factors — EcoTrack AI" },
      { name: "description", content: "How EcoTrack AI estimates CO₂e: activity data multiplied by published emission factors, normalised monthly." },
      { property: "og:title", content: "Methodology & Emission Factors — EcoTrack AI" },
      { property: "og:description", content: "Full transparency on the factors and formulas behind every estimate." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Methodology,
});

function Methodology() {
  const factors = useQuery(factorsQuery);
  const rows = factors.data?.rows ?? [];
  const grouped = rows.reduce<Record<string, typeof rows>>((acc, row) => {
    (acc[row.category] ||= []).push(row);
    return acc;
  }, {});


  return (
    <div className="min-h-screen bg-gradient-hero">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 pb-24 pt-28 sm:px-6">
        <Reveal>
          <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Methodology
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            EcoTrack AI uses the standard activity-based approach: estimated emissions equal
            activity data multiplied by an emission factor. Weekly activity is normalised to a
            monthly figure using 4.345 weeks and 30.44 days per month.
          </p>
        </Reveal>

        <Reveal>
          <LiftCard className="mt-8">
            <h2 className="font-display text-lg font-semibold">Formulas</h2>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>Transport = Σ (factor × distance per trip × trips per week × 4.345)</li>
              <li>Energy = grid factor × monthly kWh</li>
              <li>Food = diet factor × meals per day × 30.44</li>
              <li>Waste = stream factor × kg per week × 4.345</li>
            </ul>
          </LiftCard>
        </Reveal>

        <h2 className="mt-12 font-display text-2xl font-semibold tracking-tight">
          Emission factor registry
        </h2>
        {factors.isLoading ? (
          <Skeleton className="mt-4 h-72 rounded-3xl" />
        ) : (
          <div className="mt-4 space-y-4">
            {Object.entries(grouped).map(([category, rows]) => (
              <Reveal key={category}>
                <LiftCard>
                  <h3 className="flex items-center gap-2 font-display text-lg font-semibold">
                    <span
                      className="size-2.5 rounded-full"
                      style={{ background: CATEGORY_META[category]?.color ?? "var(--chart-1)" }}
                    />
                    {CATEGORY_META[category]?.label ?? category}
                  </h3>
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="text-xs uppercase tracking-wider text-muted-foreground">
                        <tr>
                          <th className="py-2 pr-4 font-medium">Activity</th>
                          <th className="py-2 pr-4 font-medium">Factor</th>
                          <th className="py-2 font-medium">Source</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/70">
                        {rows.map((r) => (
                          <tr key={r.id}>
                            <td className="py-2.5 pr-4">{r.label}</td>
                            <td className="py-2.5 pr-4 whitespace-nowrap">
                              {r.factor} {r.unit}
                            </td>
                            <td className="py-2.5 text-muted-foreground">{r.source}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </LiftCard>
              </Reveal>
            ))}
          </div>
        )}

        <Reveal>
          <LiftCard className="mt-6">
            <h2 className="font-display text-lg font-semibold">Limitations</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Results are estimates, not measurements. Factors are regional averages and do not
              capture vehicle occupancy, appliance efficiency or supplier-specific grid mixes. The
              forecast shown on the dashboard is a transparent linear trend until an external ML
              service is configured.
            </p>
          </LiftCard>
        </Reveal>
      </main>
      <SiteFooter />
    </div>
  );
}
