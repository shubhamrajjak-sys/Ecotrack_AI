import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AppShell, PageHeading } from "@/components/eco/AppShell";
import { LiftCard } from "@/components/eco/motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { localDb as supabase } from "@/lib/local-db";
import { profileQuery } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Profile & Settings — EcoTrack AI" },
      { name: "description", content: "Manage your EcoTrack AI profile, reduction target and leaderboard visibility." },
      { property: "og:title", content: "Profile & Settings — EcoTrack AI" },
      { property: "og:description", content: "Control your data, targets and privacy settings." },
    ],
  }),
  component: Profile,
});

function Profile() {
  const { user, signOut } = useAuth();
  const uid = user?.id ?? "";
  const qc = useQueryClient();
  const profile = useQuery({ ...profileQuery(uid), enabled: !!uid });
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    display_name: "",
    department: "",
    campus: "",
    reduction_target_pct: 20,
    share_on_leaderboard: true,
  });

  useEffect(() => {
    if (profile.data) {
      setForm({
        display_name: profile.data.display_name ?? "",
        department: profile.data.department ?? "",
        campus: profile.data.campus ?? "",
        reduction_target_pct: profile.data.reduction_target_pct ?? 20,
        share_on_leaderboard: profile.data.share_on_leaderboard ?? true,
      });
    }
  }, [profile.data]);

  async function save() {
    setSaving(true);
    const { error } = await supabase.from("profiles").update(form).eq("id", uid);
    setSaving(false);
    if (error) {
      toast.error("Could not save", { description: error.message });
      return;
    }
    await qc.invalidateQueries({ queryKey: ["profile", uid] });
    toast.success("Profile updated");
  }

  return (
    <AppShell>
      <PageHeading title="Profile & Settings" subtitle="Your data stays yours — nothing is shared unless you opt in." />

      {profile.isLoading ? (
        <Skeleton className="h-80 rounded-3xl" />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
          <LiftCard>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="dn">Display name</Label>
                <Input
                  id="dn"
                  className="rounded-xl"
                  value={form.display_name}
                  onChange={(e) => setForm({ ...form, display_name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dep">Department</Label>
                <Input
                  id="dep"
                  className="rounded-xl"
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cam">Campus</Label>
                <Input
                  id="cam"
                  className="rounded-xl"
                  value={form.campus}
                  onChange={(e) => setForm({ ...form, campus: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tg">Reduction target (%)</Label>
                <Input
                  id="tg"
                  type="number"
                  className="rounded-xl"
                  value={form.reduction_target_pct}
                  onChange={(e) =>
                    setForm({ ...form, reduction_target_pct: Number(e.target.value) })
                  }
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between rounded-2xl border border-border/70 bg-card/60 px-4 py-3.5">
              <div>
                <p className="text-sm font-medium">Appear on the leaderboard</p>
                <p className="text-xs text-muted-foreground">Shares your display name and points only.</p>
              </div>
              <Switch
                checked={form.share_on_leaderboard}
                onCheckedChange={(v) => setForm({ ...form, share_on_leaderboard: v })}
              />
            </div>

            <Button variant="hero" className="mt-6" onClick={() => void save()} disabled={saving}>
              {saving && <Loader2 className="size-4 animate-spin" />} Save changes
            </Button>
          </LiftCard>

          <div className="grid h-fit gap-4">
            <LiftCard>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Signed in as
              </p>
              <p className="mt-2 break-all text-sm font-medium">{user?.email}</p>
              <p className="mt-4 text-xs text-muted-foreground">
                Eco points: {profile.data?.eco_points ?? 0} · Streak:{" "}
                {profile.data?.streak_days ?? 0} days
              </p>
              <Button variant="outline" className="mt-5 w-full" onClick={() => void signOut()}>
                <LogOut className="size-4" /> Sign out
              </Button>
            </LiftCard>
          </div>
        </div>
      )}
    </AppShell>
  );
}
