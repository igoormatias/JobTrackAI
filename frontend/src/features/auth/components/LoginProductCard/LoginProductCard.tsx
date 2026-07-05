"use client";

import { motion } from "framer-motion";

import type { LoginProductPreview } from "../../constants/login-content";
import { LOGIN_LAYOUT } from "../../constants/login-layout";

export type LoginProductCardProps = LoginProductPreview & {
  index: number;
};

export const LoginProductCard = ({ icon: Icon, title, description, accent, index }: LoginProductCardProps) => (
  <motion.article
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay: 0.1 + index * 0.05, ease: "easeOut" }}
    className={LOGIN_LAYOUT.productCard}
  >
    <div
      className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br ${accent}`}
    >
      <Icon className="h-5 w-5 text-primary" aria-hidden />
    </div>
    <h3 className="text-sm font-semibold text-foreground">{title}</h3>
    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
  </motion.article>
);
