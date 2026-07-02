"use client";

import { Button } from "@/components/ui/Button";

import { GoogleIcon } from "../GoogleIcon";
import { useLoginMutation } from "../../hooks/use-auth-mutations";

export const GoogleLoginButton = () => {
  const loginMutation = useLoginMutation();

  return (
    <Button
      type="button"
      variant="primary"
      size="lg"
      className="h-12 w-full gap-3 text-base font-medium"
      onClick={() => loginMutation.mutate()}
      disabled={loginMutation.isPending}
      isLoading={loginMutation.isPending}
    >
      <GoogleIcon />
      Entrar com Google
    </Button>
  );
};
