"use client";

import { motion } from "framer-motion";

import { JobTrackLogo } from "@/components/brand";
import { Caption, Heading, Subtitle } from "@/components/typography";

import { LOGIN_HERO, LOGIN_PRODUCT_PREVIEWS } from "../../constants/login-content";
import { LOGIN_LAYOUT } from "../../constants/login-layout";
import { LoginProductCard } from "../LoginProductCard";

export const LoginHeroPanel = () => (
  <section className={LOGIN_LAYOUT.heroPanel} aria-labelledby="login-hero-title">
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="space-y-8"
    >
      <JobTrackLogo variant="full" theme="dark" priority className="h-10 w-auto sm:h-11" />

      <div className="space-y-4">
        <Caption className="break-words uppercase tracking-[0.2em] text-primary/80">{LOGIN_HERO.eyebrow}</Caption>
        <Heading id="login-hero-title" level={1} className={LOGIN_LAYOUT.heroTitle}>
          {LOGIN_HERO.title}
          <span className="mt-2 block">
            <span className={LOGIN_LAYOUT.heroHighlight}>{LOGIN_HERO.highlight}</span>
          </span>
        </Heading>
        <Subtitle className={LOGIN_LAYOUT.heroSubtitle}>{LOGIN_HERO.subtitle}</Subtitle>
      </div>

      <div className={LOGIN_LAYOUT.productGrid} aria-label="Recursos da plataforma">
        {LOGIN_PRODUCT_PREVIEWS.map((product, index) => (
          <LoginProductCard key={product.title} {...product} index={index} />
        ))}
      </div>
    </motion.div>
  </section>
);
