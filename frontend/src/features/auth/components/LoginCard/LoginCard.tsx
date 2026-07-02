import { type ReactNode } from "react";

import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

import { LOGIN_LAYOUT } from "../../constants/login-layout";

export type LoginCardProps = {
  children: ReactNode;
  className?: string;
};

export const LoginCard = ({ children, className }: LoginCardProps) => (
  <div className={LOGIN_LAYOUT.shell}>
    <Card
      role="main"
      aria-labelledby="login-title"
      className={cn(LOGIN_LAYOUT.card, LOGIN_LAYOUT.stack, className)}
    >
      {children}
    </Card>
  </div>
);
