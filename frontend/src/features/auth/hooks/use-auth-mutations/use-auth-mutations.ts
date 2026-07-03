"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { queryKeys } from "@/lib/query-client/query-keys";

import { useAuthContext } from "../../context/AuthProvider";
import { getCurrentUser, loginWithGoogle, logout } from "../../services/auth-service";
import { getPostLoginRedirect } from "../../utils/auth-utils";

export const useCurrentUserQuery = () =>
  useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: getCurrentUser,
    retry: false,
  });

export const useLoginMutation = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setAuthState } = useAuthContext();

  return useMutation({
    mutationFn: (idToken: string) => loginWithGoogle({ provider: "google", idToken }),
    onSuccess: (response) => {
      setAuthState(response);
      void queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
      router.replace(getPostLoginRedirect(response.user.onboardingCompleted));
    },
  });
};

export const useLogoutMutation = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setAuthState } = useAuthContext();

  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      setAuthState(null);
      void queryClient.clear();
      router.replace("/login");
    },
  });
};
