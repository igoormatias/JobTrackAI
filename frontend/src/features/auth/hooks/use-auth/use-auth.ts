"use client";

import { useAuthContext } from "../../context/AuthProvider";

export const useAuth = () => useAuthContext();

export const useSession = () => {
  const { session, isLoading, isAuthenticated } = useAuthContext();

  return { session, isLoading, isAuthenticated };
};

export const useCurrentUser = () => {
  const { user, isLoading } = useAuthContext();

  return { user, isLoading };
};
