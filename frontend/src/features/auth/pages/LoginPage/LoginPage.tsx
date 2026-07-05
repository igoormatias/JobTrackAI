"use client";

import { LOGIN_LAYOUT } from "../../constants/login-layout";
import { useAuth } from "../../hooks/use-auth";
import { LoginAuthPanel } from "../../components/LoginAuthPanel";
import { LoginBackground } from "../../components/LoginBackground";
import { LoginHeroPanel } from "../../components/LoginHeroPanel";
import { LoginPageSkeleton } from "../../components/LoginPageSkeleton";

export const LoginPage = () => {
  const { isLoading } = useAuth();

  return (
    <div className={LOGIN_LAYOUT.page}>
      <LoginBackground />
      <div className={LOGIN_LAYOUT.grid}>
        {isLoading ? <LoginPageSkeleton /> : null}
        {!isLoading ? (
          <>
            <LoginHeroPanel />
            <LoginAuthPanel />
          </>
        ) : null}
      </div>
    </div>
  );
};
