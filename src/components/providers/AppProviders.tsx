"use client";

import { ThemeProvider } from "next-themes";
import { MotionConfig } from "motion/react";
import { Toaster } from "@/components/ui/toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import Providers from "@/app/providers";

const AppProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <Providers>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <MotionConfig reducedMotion="user">
        <TooltipProvider delay={300}>
          <Toaster limit={3}>{children}</Toaster>
        </TooltipProvider>
      </MotionConfig>
    </ThemeProvider>
    </Providers>
  );
};

export default AppProviders;
