"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { SyncProvider } from "@/components/sync-provider";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <SyncProvider>
        {children}
      </SyncProvider>
      <Toaster position="top-right" richColors />
    </ThemeProvider>
  );
}

