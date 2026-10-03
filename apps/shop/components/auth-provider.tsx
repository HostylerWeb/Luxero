"use client";

import { createContext, type ReactNode, useContext, useEffect, useRef, useState } from "react";
import { authClient } from "@/lib/auth-client";

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  isAnonymous?: boolean;
  emailVerified?: boolean;
}

export interface AuthState {
  user: AuthUser | null;
  isAnonymous: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  isAnonymous: false,
  isAuthenticated: false,
  isLoading: true,
  logout: async () => {},
});

export function useAuth(): AuthState {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending, error: sessionError } = authClient.useSession();
  const anonStarted = useRef(false);
  const anonFailed = useRef(false);
  const [anonReady, setAnonReady] = useState(false);

  useEffect(() => {
    if (isPending || sessionError) return;
    if (session?.user) {
      if (!session.user.isAnonymous && typeof window !== "undefined") {
        (window as any).umami?.identify({ id: session.user.email!, email: session.user.email! });
      }
      setAnonReady(true);
      return;
    }

    if (anonStarted.current || anonFailed.current) return;
    anonStarted.current = true;

    authClient.signIn
      .anonymous()
      .then(() => setAnonReady(true))
      .catch(() => {
        anonFailed.current = true;
        setAnonReady(true);
      });
  }, [session, isPending, sessionError]);

  const user = session?.user
    ? {
        id: session.user.id,
        email: session.user.email ?? "",
        name: session.user.name ?? undefined,
        firstName: (session.user as Record<string, unknown>).firstName as string | undefined,
        lastName: (session.user as Record<string, unknown>).lastName as string | undefined,
        isAnonymous: (session.user as Record<string, unknown>).isAnonymous as boolean | undefined,
        emailVerified: session.user.emailVerified ?? false,
      }
    : null;

  const isAnonymous = user?.isAnonymous ?? false;

  const isLoading = isPending || (!session?.user && !anonReady);

  const value: AuthState = {
    user,
    isAnonymous,
    isAuthenticated: !!user && !isAnonymous,
    isLoading,
    logout: async () => {
      await authClient.signOut();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
