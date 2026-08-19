import type { Session, User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { supabase } from "@/integrations/supabase/client";
import { completeOAuthRedirect } from "@/lib/auth-redirect";

type AuthState = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  oauthCompleted: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState>({
  user: null,
  session: null,
  loading: true,
  oauthCompleted: false,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [oauthCompleted, setOAuthCompleted] = useState(false);

  useEffect(() => {
    let active = true;
    let initializing = true;

    // Subscribe before reading storage so a redirect/session event cannot be
    // missed between the initial lookup and listener registration.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      if (!active) return;
      setSession(next);
      if (!initializing) setLoading(false);
    });

    void (async () => {
      const completed = await completeOAuthRedirect();
      const { data, error } = await supabase.auth.getSession();
      if (!active) return;
      initializing = false;
      setOAuthCompleted(completed);
      setSession(error ? null : data.session);
      setLoading(false);
    })();

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      oauthCompleted,
      signOut: async () => {
        await supabase.auth.signOut();
      },
    }),
    [session, loading, oauthCompleted],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
