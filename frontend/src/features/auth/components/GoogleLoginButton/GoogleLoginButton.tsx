"use client";

import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/feedback/Spinner";

import { useLoginMutation } from "../../hooks/use-auth-mutations";

export const GoogleLoginButton = () => {
  const loginMutation = useLoginMutation();

  return (
    <Button
      type="button"
      variant="outline"
      className="h-12 w-full border-border bg-white text-base font-medium text-black hover:bg-white/90"
      onClick={() => loginMutation.mutate()}
      disabled={loginMutation.isPending}
    >
      {loginMutation.isPending ? (
        <Spinner className="h-5 w-5 text-black" />
      ) : (
        <>
          <span className="mr-3 flex h-5 w-5 items-center justify-center rounded-full bg-white text-sm font-bold text-[#4285F4]">
            G
          </span>
          Entrar com Google
        </>
      )}
    </Button>
  );
};
