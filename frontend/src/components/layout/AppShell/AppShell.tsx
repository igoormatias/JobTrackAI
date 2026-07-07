"use client";

import { motion } from "framer-motion";
import { type ReactNode } from "react";

import { Container } from "@/components/layout/Container";
import { useContainerSize } from "@/components/layout/ContainerSizeContext";
import { AppHeader } from "@/components/navigation/AppHeader";
import { BottomNav } from "@/components/navigation/BottomNav";
import { Sidebar } from "@/components/navigation/Sidebar";
import { pageTransition } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

export type AppShellProps = {
  children: ReactNode;
  headerTitle?: string;
  className?: string;
};

export const AppShell = ({ children, headerTitle, className }: AppShellProps) => {
  const reducedMotion = useReducedMotion();
  const containerSize = useContainerSize();

  return (
    <div className={cn("flex min-h-screen bg-background", className)}>
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader title={headerTitle} />

        <motion.main
          className="flex min-h-0 min-w-0 flex-1 flex-col pb-20 lg:pb-6"
          {...(reducedMotion ? {} : pageTransition)}
        >
          <Container size={containerSize} className="flex min-h-0 flex-1 flex-col py-6">
            {children}
          </Container>
        </motion.main>
      </div>

      <BottomNav />
    </div>
  );
};
