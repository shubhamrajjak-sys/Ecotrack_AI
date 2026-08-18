import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Crown, Medal, Trophy } from "lucide-react";

import { AppShell, PageHeading } from "@/components/eco/AppShell";
import { Counter, LiftCard } from "@/components/eco/motion";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { leaderboardQuery } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/leaderboard")({
  head: () => ({
    meta: [
      { title: "Campus Leaderboard — EcoTrack AI" },
      { name: "description", content: "See how your eco points compare across the campus community." },
      { property: "og:title", content: "Campus Leaderboard — EcoTrack AI" },
      { property: "og:description", content: "Friendly competition for campus carbon reduction." },
    ],
  }),
  component: Leaderboard,
});

type Row = {
  user_id: string;
  display_name: string | null;
  department: string | null;
  eco_points: number;
  streak_days: number;
};

function Leaderboard() {
  const { user } = useAuth();
  const board = useQuery(leaderboardQuery);
  const rows = (board.data ?? []) as Row[];

  const podium = rows.slice(0, 3);
  const rest = rows.slice(3);

  return (
    <AppShell>
      <PageHeading
        title="Campus Leaderboard"
        subtitle="Only members who opted in to sharing appear here. Points come from logged calculations and completed goals."
      />

      {board.isLoading ? (
        <Skeleton className="h-96 rounded-3xl" />
      ) : rows.length === 0 ? (
        <LiftCard className="text-center">
          <Trophy className="mx-auto size-8 text-primary" />
          <p className="mt-3 font-display text-xl font-semibold">No entries yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Be the first to log a footprint and appear on the board.
          </p>
        </LiftCard>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            {podium.map((r, i) => (
              <motion.div
                key={r.user_id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, type: "spring", stiffness: 220, damping: 22 }}
                className={`glass-panel rounded-3xl p-6 text-center ${i === 0 ? "sm:-mt-4 sm:shadow-lift" : ""}`}
              >
                <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground">
                  {i === 0 ? <Crown className="size-5" /> : <Medal className="size-5" />}
                </span>
                <p className="mt-3 font-medium">{r.display_name ?? "Anonymous"}</p>
                <p className="text-xs text-muted-foreground">{r.department ?? "Campus member"}</p>
                <p className="mt-3 font-display text-3xl font-semibold">
                  <Counter value={r.eco_points} />
                </p>
                <p className="text-xs text-muted-foreground">eco points</p>
              </motion.div>
            ))}
          </div>

          <LiftCard className="mt-4 p-0">
            <ul className="divide-y divide-border/70">
              {rest.map((r, i) => (
                <motion.li
                  key={r.user_id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`flex items-center justify-between px-6 py-4 text-sm ${
                    r.user_id === user?.id ? "bg-accent/50" : ""
                  }`}
                >
                  <span className="flex items-center gap-4">
                    <span className="w-6 text-muted-foreground">{i + 4}</span>
                    <span>
                      <span className="font-medium">{r.display_name ?? "Anonymous"}</span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        {r.department ?? ""}
                      </span>
                    </span>
                  </span>
                  <span className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground">🔥 {r.streak_days}d</span>
                    <span className="font-medium">{r.eco_points}</span>
                  </span>
                </motion.li>
              ))}
            </ul>
          </LiftCard>
        </>
      )}
    </AppShell>
  );
}
