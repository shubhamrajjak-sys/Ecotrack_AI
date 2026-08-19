import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Leaf } from "lucide-react";
import { useEffect, useState } from "react";

import { ParticleField } from "@/components/eco/ParticleField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Enter your name — EcoTrack AI" },
      {
        name: "description",
        content: "Enter your name to open your EcoTrack AI campus carbon dashboard.",
      },
      { property: "og:title", content: "Enter your name — EcoTrack AI" },
      { property: "og:description", content: "Access your campus carbon dashboard." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading, signIn } = useAuth();
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && user) void navigate({ to: "/dashboard", replace: true });
  }, [user, loading, navigate]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Please enter your name");
      return;
    }
    setError("");
    signIn(trimmed);
    void navigate({ to: "/dashboard", replace: true });
  }

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

        <h1 className="mt-7 font-display text-2xl font-semibold tracking-tight">
          Welcome to EcoTrack AI
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">Enter your name to continue</p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Your name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError("");
              }}
              placeholder="Enter your name"
              maxLength={60}
              autoComplete="name"
              className="rounded-xl"
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <Button type="submit" variant="hero" size="lg" className="w-full">
            Continue to Dashboard
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Your name is stored only on this device. Measure. Understand. Reduce.
        </p>
      </motion.div>
    </div>
  );
}
