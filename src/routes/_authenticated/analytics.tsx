import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Building2, Users } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { AppShell, PageHeading } from "@/components/eco/AppShell";
import { Counter, LiftCard, Reveal } from "@/components/eco/motion";
import { Skeleton } from "@/components/ui/skeleton";
import { campusQuery } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({
    meta: [
      { title: "Campus Analytics — EcoTrack AI" },
      { name: "description", content: "Aggregated, anonymised campus carbon intelligence across departments and categories." },
      { property: "og:title", content: "Campus Analytics — EcoTrack AI" },
      { property: "og:description", content: "Aggregate emissions intelligence for campus sustainability teams." },
    ],
  }),
  component: Analytics,
});

type Campus = {
  participants: number;
  calculations: number;
  avg_total_kg: number | null;
  avg_transport_kg: number | null;
  avg_energy_kg: number | null;
  avg_food_kg: number | null;
  avg_waste_kg: number | null;
};

function Analytics() {
  const campus = useQuery(campusQuery);
  const d = campus.data as Campus | null;

  const hasData = !!d && d.calculations > 0;
  const bars = hasData
    ? [
        { name: "Transport", value: Number(d.avg_transport_kg ?? 0) },
        { name: "Energy", value: Number(d.avg_energy_kg ?? 0) },
        { name: "Food", value: Number(d.avg_food_kg ?? 0) },
        { name: "Waste", value: Number(d.avg_waste_kg ?? 0) },
      ]
    : [];

  return (
    <AppShell>
      <PageHeading
        title="Campus Analytics"
        subtitle="Aggregated and anonymised. Individual footprints are never exposed here."
      />

      {campus.isLoading ? (
        <Skeleton className="h-80 rounded-3xl" />
      ) : !hasData ? (
        <LiftCard className="text-center">
          <Building2 className="mx-auto size-8 text-primary" />
          <p className="mt-3 font-display text-xl font-semibold">No campus data yet</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            Aggregate insights appear once community members start logging calculations.
          </p>
        </LiftCard>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "Participants", value: d.participants, icon: Users, decimals: 0, suffix: "" },
              { label: "Calculations logged", value: d.calculations, icon: Building2, decimals: 0, suffix: "" },
              {
                label: "Average footprint",
                value: Number(d.avg_total_kg ?? 0),
                icon: Building2,
                decimals: 1,
                suffix: " kg",
              },
            ].map((s, i) => (
              <Reveal key={s.label} delay={i * 0.06}>
                <LiftCard>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {s.label}
                    </p>
                    <s.icon className="size-4 text-primary" />
                  </div>
                  <p className="mt-3 font-display text-3xl font-semibold">
                    <Counter value={s.value} decimals={s.decimals} />
                    <span className="text-base font-medium text-muted-foreground">{s.suffix}</span>
                  </p>
                </LiftCard>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <LiftCard className="mt-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Average emissions by category (kg CO₂e / month)
              </h3>
              <div className="mt-5 h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bars}>
                    <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
                    <YAxis tickLine={false} axisLine={false} fontSize={12} width={44} />
                    <Tooltip
                      cursor={{ fill: "var(--muted)", opacity: 0.4 }}
                      formatter={(v: number) => [`${v.toFixed(1)} kg CO₂e`, "Average"]}
                      contentStyle={{
                        borderRadius: 16,
                        border: "1px solid var(--border)",
                        background: "var(--card)",
                      }}
                    />
                    <Bar
                      dataKey="value"
                      fill="var(--chart-1)"
                      radius={[12, 12, 4, 4]}
                      animationDuration={1200}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                All values are estimated CO₂e averages computed from opted-in member calculations.
              </p>
            </LiftCard>
          </Reveal>
        </>
      )}
    </AppShell>
  );
}
