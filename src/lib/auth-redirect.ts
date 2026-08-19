import { supabase } from "@/integrations/supabase/client";

/**
 * Supabase may return the OAuth result to ANY allowed redirect URL — including
 * the bare site root (https://your-app.vercel.app/?code=...) when the exact
 * /auth/callback URL is not in the allow-list. This helper completes the
 * session exchange no matter which URL we land on, then cleans the URL.
 *
 * Returns true when a session was established from the current URL.
 */
export async function completeOAuthRedirect(): Promise<boolean> {
  if (typeof window === "undefined") return false;

  const url = new URL(window.location.href);
  const hash = new URLSearchParams(url.hash.replace(/^#/, ""));
  const code = url.searchParams.get("code");
  const hasImplicitTokens = Boolean(hash.get("access_token"));

  if (!code && !hasImplicitTokens) return false;

  try {
    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) throw error;
    } else {
      const access_token = hash.get("access_token")!;
      const refresh_token = hash.get("refresh_token") ?? "";
      const { error } = await supabase.auth.setSession({ access_token, refresh_token });
      if (error) throw error;
    }
  } catch (error) {
    console.error("[auth] OAuth redirect exchange failed", error);
    return false;
  } finally {
    // Strip auth params so a refresh doesn't retry a consumed code.
    url.searchParams.delete("code");
    url.searchParams.delete("state");
    url.hash = "";
    window.history.replaceState({}, "", url.pathname + url.search);
  }

  const { data } = await supabase.auth.getSession();
  return Boolean(data.session);
}
