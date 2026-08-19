import { supabase } from "@/integrations/supabase/client";

export type OAuthResult = { error?: unknown; redirected?: boolean };

export async function signInWithGoogle(): Promise<OAuthResult> {
  const origin = window.location.origin;
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: origin },
  });
  if (error) return { error };
  return { redirected: true };
}
