import { supabase } from "@/integrations/supabase/client";

/**
 * Lovable's hosted OAuth broker (/~oauth/initiate) only exists on Lovable
 * domains. Anywhere else (Vercel, custom domains, localhost) we use Supabase
 * Auth's own Google OAuth flow, which is production-compatible.
 */
function isLovableHost(hostname: string) {
  return hostname.endsWith(".lovable.app") || hostname.endsWith(".lovableproject.com");
}

export type OAuthResult = { error?: unknown; redirected?: boolean };

export async function signInWithGoogle(): Promise<OAuthResult> {
  const origin = window.location.origin;

  if (isLovableHost(window.location.hostname)) {
    const { lovable } = await import("@/integrations/lovable");
    return lovable.auth.signInWithOAuth("google", { redirect_uri: origin });
  }

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${origin}/auth/callback` },
  });
  if (error) return { error };
  // Supabase performs a full-page redirect to Google.
  return { redirected: true };
}
