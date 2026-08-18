import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { CheckCircle2, Plus, Target } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell, PageHeading } from "@/components/eco/AppShell";
import { LiftCard, ProgressBar, Reveal } from "@/components/eco/motion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { BADGES } from "@/lib/carbon";
import { achievementsQuery, addEcoPoints, goalsQuery, profileQuery } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/goals")({
  head: () => ({
    meta: [
      { title: "Goals & Achievements — EcoTrack AI" },
      { name: "description", content: "Set carbon reduction goals, track progress and unlock campus sustainability badges." },
      { property: "og:title", content: "Goals & Achievements — EcoTrack AI" },
      { property: "og:description", content: "Reduction goals, streaks and badges for campus sustainability." },
    ],
  }),
  component: Goals,
});

function Goals() {
  const { user } = useAuth();
  const uid = user?.id ?? "";
  const qc = useQueryClient();
  const goals = useQuery({ ...goalsQuery(uid), enabled: !!uid });
  const badges = useQuery({ ...achievementsQuery(uid), enabled: !!uid });
  const profile = useQuery({ ...profileQuery(uid), enabled: !!uid });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    category: "transport",
    target_value: 20,
    unit: "kg CO₂e",
  });

  async function create() {
    if (!uid || !form.title.trim()) return;
    const { error } = await supabase.from("goals").insert({ user_id: uid, ...form });
    if (error) {
      toast.error("Could not create goal", { description: error.message });
      return;
    }
    setOpen(false);
    setForm({ title: "", category: "transport", target_value: 20, unit: "kg CO₂e" });
    await qc.invalidateQueries({ queryKey: ["goals", uid] });
    toast.success("Goal created");
  }

  async function complete(id: string, targetValue: number) {
    await supabase
      .from("goals")
      .update({ status: "completed", current_value: targetValue })
      .eq("id", id);
    await addEcoPoints(uid, profile.data?.eco_points ?? 0, 50);
    await qc.invalidateQueries();
    toast.success("Goal completed", { description: "+50 eco points 🌿" });
  }

  const earned = new Set((badges.data ?? []).map((b) => b.badge_code));

  return (
    <AppShell>
      <PageHeading
        title="Goals & Achievements"
        subtitle="Set your own reduction commitments. Progress is only ever based on data you log."
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="hero">
                <Plus className="size-4" /> New goal
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl">
              <DialogHeader>
                <DialogTitle>Create a reduction goal</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label htmlFor="t">Goal</Label>
                  <Input
                    id="t"
                    className="rounded-xl"
                    placeholder="Cycle to campus 3 days a week"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Category</Label>
                    <Select
                      value={form.category}
                      onValueChange={(v) => setForm({ ...form, category: v })}
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="transport">Transport</SelectItem>
                        <SelectItem value="energy">Energy</SelectItem>
                        <SelectItem value="food">Food</SelectItem>
                        <SelectItem value="waste">Waste</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="tv">Target value</Label>
                    <Input
                      id="tv"
                      type="number"
                      className="rounded-xl"
                      value={form.target_value}
                      onChange={(e) => setForm({ ...form, target_value: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <Button variant="hero" className="w-full" onClick={() => void create()}>
                  Create goal
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {goals.isLoading ? (
        <Skeleton className="h-48 rounded-3xl" />
      ) : (goals.data ?? []).length === 0 ? (
        <LiftCard className="text-center">
          <Target className="mx-auto size-8 text-primary" />
          <p className="mt-3 font-display text-xl font-semibold">No goals yet</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            Create a goal to turn your footprint insights into concrete, trackable action.
          </p>
        </LiftCard>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {(goals.data ?? []).map((g, i) => (
            <Reveal key={g.id} delay={i * 0.05}>
              <LiftCard className="h-full">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{g.title}</p>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      {g.category}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                      g.status === "completed"
                        ? "bg-gradient-primary text-primary-foreground"
                        : "bg-accent text-accent-foreground"
                    }`}
                  >
                    {g.status}
                  </span>
                </div>
                <ProgressBar
                  className="mt-4"
                  value={(Number(g.current_value) / Math.max(1, Number(g.target_value))) * 100}
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  {Number(g.current_value)} / {Number(g.target_value)} {g.unit}
                </p>
                {g.status !== "completed" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => void complete(g.id, Number(g.target_value))}
                  >
                    <CheckCircle2 className="size-4" /> Mark complete
                  </Button>
                )}
              </LiftCard>
            </Reveal>
          ))}
        </div>
      )}

      <h2 className="mt-10 font-display text-2xl font-semibold tracking-tight">Badges</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {BADGES.map((b, i) => {
          const has = earned.has(b.code);
          return (
            <motion.div
              key={b.code}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.06, type: "spring", stiffness: 260, damping: 20 }}
              className={`glass-panel rounded-3xl p-5 ${has ? "" : "opacity-55"}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{b.emoji}</span>
                <div>
                  <p className="font-medium">{b.label}</p>
                  <p className="text-xs text-muted-foreground">{has ? "Unlocked" : b.hint}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </AppShell>
  );
}
