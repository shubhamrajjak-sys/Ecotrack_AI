import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ParticleField } from "@/components/eco/ParticleField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { localDb as supabase } from "@/lib/local-db";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({
    meta: [
      { title: "Set up your profile — EcoTrack AI" },
      { name: "description", content: "Tell EcoTrack AI about your campus role so your carbon insights are relevant." },
      { property: "og:title", content: "Set up your profile — EcoTrack AI" },
      { property: "og:description", content: "Three quick steps to personalise your carbon dashboard." },
    ],
  }),
  component: Onboarding,
});

const DEPARTMENTS = [
  "Computer Science",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Chemical Engineering",
  "Physics",
  "Mathematics",
  "Management",
  "Other",
];

function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    display_name: "",
    role_type: "student",
    department: "",
    campus: "",
    reduction_target_pct: 20,
    share_on_leaderboard: true,
  });

  const steps = ["Identity", "Campus", "Targets"];

  async function finish() {
    if (!user) return;
    setBusy(true);
    const { error } = await supabase
      .from("profiles")
      .update({ ...form, onboarded: true })
      .eq("id", user.id);
    setBusy(false);
    if (error) {
      toast.error("Could not save your profile", { description: error.message });
      return;
    }
    await qc.invalidateQueries({ queryKey: ["profile", user.id] });
    toast.success("Profile ready 🌱", { description: "Let's calculate your first footprint." });
    void navigate({ to: "/calculator" });
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-hero px-4 py-16">
      <ParticleField count={10} dense />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass-panel relative w-full max-w-lg rounded-[28px] p-8 sm:p-10"
      >
        <div className="flex items-center gap-2">
          {steps.map((s, i) => (
            <div key={s} className="flex flex-1 items-center gap-2">
              <span
                className={`flex size-7 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                  i <= step ? "bg-gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {i < step ? <Check className="size-3.5" /> : i + 1}
              </span>
              {i < steps.length - 1 && <span className="h-px flex-1 bg-border" />}
            </div>
          ))}
        </div>

        <h1 className="mt-7 font-display text-2xl font-semibold tracking-tight">
          {step === 0 && "Who are you on campus?"}
          {step === 1 && "Where do you study or work?"}
          {step === 2 && "What's your reduction ambition?"}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          This context personalises your estimates and recommendations. Nothing is shared without
          your consent.
        </p>

        <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="mt-7 space-y-5">
          {step === 0 && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="dn">Display name</Label>
                <Input
                  id="dn"
                  className="rounded-xl"
                  value={form.display_name}
                  onChange={(e) => setForm({ ...form, display_name: e.target.value })}
                  placeholder="Used on the leaderboard"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Role</Label>
                <Select value={form.role_type} onValueChange={(v) => setForm({ ...form, role_type: v })}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="faculty">Faculty</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div className="space-y-1.5">
                <Label>Department</Label>
                <Select value={form.department} onValueChange={(v) => setForm({ ...form, department: v })}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="campus">Campus</Label>
                <Input
                  id="campus"
                  className="rounded-xl"
                  value={form.campus}
                  onChange={(e) => setForm({ ...form, campus: e.target.value })}
                  placeholder="e.g. Main Campus"
                />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="target">Monthly reduction target (%)</Label>
                <Input
                  id="target"
                  type="number"
                  min={5}
                  max={80}
                  className="rounded-xl"
                  value={form.reduction_target_pct}
                  onChange={(e) => setForm({ ...form, reduction_target_pct: Number(e.target.value) })}
                />
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-card/60 px-4 py-3.5">
                <div>
                  <p className="text-sm font-medium">Show me on the leaderboard</p>
                  <p className="text-xs text-muted-foreground">Only your display name and points.</p>
                </div>
                <Switch
                  checked={form.share_on_leaderboard}
                  onCheckedChange={(v) => setForm({ ...form, share_on_leaderboard: v })}
                />
              </div>
            </>
          )}
        </motion.div>

        <div className="mt-8 flex justify-between gap-3">
          <Button variant="ghost" onClick={() => (step === 0 ? navigate({ to: "/dashboard" }) : setStep(step - 1))}>
            {step === 0 ? "Skip" : "Back"}
          </Button>
          {step < 2 ? (
            <Button variant="hero" onClick={() => setStep(step + 1)}>
              Continue
            </Button>
          ) : (
            <Button variant="hero" onClick={() => void finish()} disabled={busy}>
              {busy && <Loader2 className="size-4 animate-spin" />} Finish setup
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
