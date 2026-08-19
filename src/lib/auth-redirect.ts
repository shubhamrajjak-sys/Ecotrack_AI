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
  const accessToken = hash.get("access_token");
  const refreshToken = hash.get("refresh_token");
  const hasImplicitTokens = Boolean(accessToken && refreshToken);

  if (!code && !hasImplicitTokens) return false;

  try {
    // The client can automatically restore a session from the URL. Check that
    // first so a one-time PKCE code is never exchanged twice.
    const { data: existing } = await supabase.auth.getSession();
    if (existing.session) return true;

    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) throw error;
    } else if (accessToken && refreshToken) {
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
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

  const { data, error } = await supabase.auth.getSession();
  return !error && Boolean(data.session);
}
