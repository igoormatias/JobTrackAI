"use client";

import { motion } from "framer-motion";

import { JobTrackLogo } from "@/components/brand";
import { Heading, Muted } from "@/components/typography";

import { LOGIN_LAYOUT } from "../../constants/login-layout";
import { GoogleLoginButton } from "../GoogleLoginButton";
import { LoginLegalFooter } from "../LoginLegalFooter";
import { LoginSiteFooter } from "../LoginSiteFooter";

export const LoginAuthPanel = () => (
  <section className={LOGIN_LAYOUT.authPanel} aria-labelledby="login-panel-title">
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.08, ease: "easeOut" }}
      className={LOGIN_LAYOUT.authCard}
      role="main"
    >
      <div className={LOGIN_LAYOUT.authStack}>
        <div className="flex flex-col items-center gap-4 text-center lg:items-start lg:text-left">
          <JobTrackLogo variant="mark" theme="dark" className="h-12 w-12 lg:hidden" />
          <div className="space-y-2">
            <Heading id="login-panel-title" level={2} className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Bem-vindo ao JobTrack AI
            </Heading>
            <Muted className="text-sm sm:text-base">
              Entre com sua conta Google para organizar vagas, pipeline e entrevistas.
            </Muted>
          </div>
        </div>

        <div className="space-y-6">
          <GoogleLoginButton />
          <LoginLegalFooter />
        </div>
      </div>
    </motion.div>

    <LoginSiteFooter className="mt-6 w-full" />
  </section>
);
