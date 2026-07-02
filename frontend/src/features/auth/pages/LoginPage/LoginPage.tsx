"use client";

import { Body } from "@/components/typography";

import { GoogleLoginButton } from "../../components/GoogleLoginButton";
import { JobTrackLogo } from "../../components/JobTrackLogo";
import { LoginCard } from "../../components/LoginCard";
import { LoginLegalFooter } from "../../components/LoginLegalFooter";
import { LOGIN_LAYOUT } from "../../constants/login-layout";
import { useAuth } from "../../hooks/use-auth";
import { LoadingSessionPage } from "../LoadingSessionPage";

export const LoginPage = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSessionPage />;
  }

  return (
    <LoginCard>
      <JobTrackLogo />

      <Body className={LOGIN_LAYOUT.tagline}>Sua busca por emprego, inteligente e organizada.</Body>

      <div className="w-full space-y-6">
        <GoogleLoginButton />
        <LoginLegalFooter />
      </div>
    </LoginCard>
  );
};
