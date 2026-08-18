import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";

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

  useEffect(() => {
    let cancelled = false;

    async function finish() {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      const errorDescription = url.searchParams.get("error_description");

      if (errorDescription) {
        toast.error("Google sign-in failed", { description: errorDescription });
        void navigate({ to: "/auth", search: { mode: "signin" } });
        return;
      }

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          toast.error("Google sign-in failed", { description: error.message });
          void navigate({ to: "/auth", search: { mode: "signin" } });
          return;
        }
      }

      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      if (data.session) {
        void navigate({ to: "/dashboard" });
      } else {
        void navigate({ to: "/auth", search: { mode: "signin" } });
      }
    }

    void finish();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-hero px-4">
      <div className="glass-panel flex items-center gap-3 rounded-3xl px-8 py-6 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Completing sign-in…
      </div>
    </div>
  );
}
