import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/auth_/callback")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Signing you in — EcoTrack AI" },
      { name: "description", content: "Completing your secure EcoTrack AI sign-in." },
      { property: "og:title", content: "Signing you in — EcoTrack AI" },
      { property: "og:description", content: "Completing your secure EcoTrack AI sign-in." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthCallback,
});

function AuthCallback() {
  const navigate = useNavigate();
  const { loading, user } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (user) void navigate({ to: "/dashboard", replace: true });
    else void navigate({ to: "/auth", search: { mode: "signin" }, replace: true });
  }, [loading, user, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-hero px-4">
      <div className="glass-panel flex items-center gap-3 rounded-3xl px-8 py-6 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Completing sign-in…
      </div>
    </div>
  );
}
