"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { type ReactNode } from "react";

type GoogleAuthProviderProps = {
  children: ReactNode;
};

export const GoogleAuthProvider = ({ children }: GoogleAuthProviderProps) => {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!clientId) {
    throw new Error("NEXT_PUBLIC_GOOGLE_CLIENT_ID is required for Google OAuth");
  }

  return <GoogleOAuthProvider clientId={clientId}>{children}</GoogleOAuthProvider>;
};
