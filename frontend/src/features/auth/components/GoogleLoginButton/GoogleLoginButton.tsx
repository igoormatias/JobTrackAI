"use client";

import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { toast } from "sonner";

import { useLoginMutation } from "../../hooks/use-auth-mutations";

export const GoogleLoginButton = () => {
  const loginMutation = useLoginMutation();

  const handleSuccess = (credentialResponse: CredentialResponse) => {
    const idToken = credentialResponse.credential;

    if (!idToken) {
      toast.error("Não foi possível obter credencial do Google");
      return;
    }

    loginMutation.mutate(idToken);
  };

  const handleError = () => {
    toast.error("Falha ao entrar com Google");
  };

  return (
    <div className="flex w-full justify-center [&>div]:w-full [&_iframe]:w-full">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        text="signin_with"
        shape="rectangular"
        size="large"
        width="100%"
      />
    </div>
  );
};
