"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";

import { getCurrentUser } from "@/features/auth/services/auth-service";
import type { AuthPermissions, AuthProfile, AuthResponse, AuthSession, AuthUser } from "@/features/auth/types";
import { AUTH_SESSION_EXPIRED_EVENT } from "@/features/auth/utils/auth-utils";
import { isProtectedRoute } from "@/features/auth/utils/middleware-utils";

type AuthContextValue = {
  user: AuthUser | null;
  profile: AuthProfile | null;
  session: AuthSession | null;
  permissions: AuthPermissions | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: Error | null;
  setAuthState: (response: AuthResponse | null) => void;
  refreshAuth: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const buildSession = (response: AuthResponse): AuthSession => ({
  user: response.user,
  profile: response.profile,
  permissions: response.permissions,
  expiresAt: null,
});

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [permissions, setPermissions] = useState<AuthPermissions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const setAuthState = useCallback((response: AuthResponse | null) => {
    if (!response) {
      setUser(null);
      setProfile(null);
      setPermissions(null);
      return;
    }

    setUser(response.user);
    setProfile(response.profile);
    setPermissions(response.permissions);
  }, []);

  const refreshAuth = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getCurrentUser();
      setAuthState(response);
    } catch (authError) {
      setAuthState(null);
      setError(authError instanceof Error ? authError : new Error("Unable to load session"));
    } finally {
      setIsLoading(false);
    }
  }, [setAuthState]);

  useEffect(() => {
    void refreshAuth();
  }, [refreshAuth]);

  useEffect(() => {
    const handleSessionExpired = () => {
      setAuthState(null);
      router.replace("/session-expired");
    };

    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, handleSessionExpired);
    return () => window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, handleSessionExpired);
  }, [router, setAuthState]);

  useEffect(() => {
    if (isLoading || !user) {
      return;
    }

    if (!user.onboardingCompleted && isProtectedRoute(pathname) && pathname !== "/onboarding") {
      router.replace("/onboarding");
      return;
    }

    if (user.onboardingCompleted && pathname === "/onboarding") {
      router.replace("/dashboard");
    }
  }, [isLoading, pathname, router, user]);

  const session = useMemo(
    () => (user && permissions ? buildSession({ user, profile, permissions }) : null),
    [permissions, profile, user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      session,
      permissions,
      isLoading,
      isAuthenticated: Boolean(user),
      error,
      setAuthState,
      refreshAuth,
    }),
    [error, isLoading, permissions, profile, refreshAuth, session, setAuthState, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = (): AuthContextValue => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }

  return context;
};
