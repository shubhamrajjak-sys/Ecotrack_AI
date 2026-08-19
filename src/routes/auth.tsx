import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Leaf, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { ParticleField } from "@/components/eco/ParticleField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { signInWithGoogle } from "@/lib/oauth";

const searchSchema = z.object({
  mode: z.enum(["signin", "signup", "reset"]).catch("signin"),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Sign in — EcoTrack AI" },
      {
        name: "description",
        content: "Sign in or create your EcoTrack AI account to track your estimated campus carbon footprint.",
      },
      { property: "og:title", content: "Sign in — EcoTrack AI" },
      { property: "og:description", content: "Access your campus carbon dashboard." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) void navigate({ to: "/dashboard" });
  }, [user, loading, navigate]);

  const setMode = (next: "signin" | "signup" | "reset") =>
    navigate({ to: "/auth", search: { mode: next } });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth`,
        });
        if (error) throw error;
        toast.success("Password reset link sent", { description: "Check your inbox." });
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: name || email.split("@")[0] },
          },
        });
        if (error) throw error;
        if (data.session) {
          toast.success("Account created", { description: "Let's set up your profile." });
          void navigate({ to: "/onboarding" });
        } else {
          toast.success("Check your email to confirm your account");
          void setMode("signin");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back 🌱");
        void navigate({ to: "/dashboard" });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setBusy(true);
    const result = await signInWithGoogle();
    if (result.error) {
      setBusy(false);
      toast.error("Google sign-in failed", { description: String(result.error) });
      return;
    }
    if (result.redirected) return;
    void navigate({ to: "/dashboard" });
  }

  const title =
    mode === "signup" ? "Create your account" : mode === "reset" ? "Reset password" : "Welcome back";

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-hero px-4 py-16">
      <ParticleField count={12} dense />
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="glass-panel relative w-full max-w-md rounded-[28px] p-8 sm:p-10"
      >
        <div className="flex items-center gap-2.5">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground">
            <Leaf className="size-5" />
          </span>
          <span className="font-display text-lg font-semibold">EcoTrack AI</span>
        </div>

        <h1 className="mt-7 font-display text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {mode === "reset"
            ? "We'll email you a secure link to set a new password."
            : "Measure. Understand. Reduce."}
        </p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          {mode === "signup" && (
            <div className="space-y-1.5">
              <Label htmlFor="name">Display name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Shown on the leaderboard"
                className="rounded-xl"
              />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@campus.edu"
              className="rounded-xl"
            />
          </div>
          {mode !== "reset" && (
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="rounded-xl"
              />
            </div>
          )}

          <Button type="submit" variant="hero" size="lg" className="w-full" disabled={busy}>
            {busy && <Loader2 className="size-4 animate-spin" />}
            {mode === "signup" ? "Create account" : mode === "reset" ? "Send reset link" : "Sign in"}
          </Button>
        </form>

        {mode !== "reset" && (
          <>
            <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
            </div>
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => void handleGoogle()}
              disabled={busy}
            >
              Continue with Google
            </Button>
          </>
        )}

        <div className="mt-6 space-y-2 text-center text-sm text-muted-foreground">
          {mode === "signin" && (
            <>
              <p>
                New here?{" "}
                <button type="button" className="font-medium text-primary hover:underline" onClick={() => void setMode("signup")}>
                  Create an account
                </button>
              </p>
              <p>
                <button type="button" className="hover:underline" onClick={() => void setMode("reset")}>
                  Forgot password?
                </button>
              </p>
            </>
          )}
          {mode !== "signin" && (
            <p>
              <button type="button" className="font-medium text-primary hover:underline" onClick={() => void setMode("signin")}>
                Back to sign in
              </button>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
