import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { NAME_KEY, ensureLocalProfile, localUserId } from "@/lib/local-db";

export type LocalUser = {
  id: string;
  name: string;
};

type AuthState = {
  user: LocalUser | null;
  loading: boolean;
  signIn: (name: string) => LocalUser;
  signOut: () => void;
};

const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  signIn: () => ({ id: "", name: "" }),
  signOut: () => {},
});

function readStoredName(): string | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(NAME_KEY);
  const name = raw?.trim();
  return name ? name : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const name = readStoredName();
    if (name) {
      const next = { id: localUserId(name), name };
      ensureLocalProfile(next.id, name);
      setUser(next);
    }
    setLoading(false);
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      loading,
      signIn: (rawName: string) => {
        const name = rawName.trim();
        const next = { id: localUserId(name), name };
        window.localStorage.setItem(NAME_KEY, name);
        ensureLocalProfile(next.id, name);
        setUser(next);
        return next;
      },
      signOut: () => {
        window.localStorage.removeItem(NAME_KEY);
        setUser(null);
      },
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
