import { cn } from "@/lib/utils";

import { LOGIN_LAYOUT } from "../../constants/login-layout";

export const LoginLegalFooter = () => (
  <p className={cn(LOGIN_LAYOUT.legal)}>
    Ao continuar, você concorda com nossos{" "}
    <a href="/terms" className="cursor-pointer text-primary underline-offset-4 hover:underline">
      Termos de Serviço
    </a>{" "}
    e{" "}
    <a href="/privacy" className="cursor-pointer text-primary underline-offset-4 hover:underline">
      Política de Privacidade
    </a>
    .
  </p>
);
