"use client";

import { useSync } from "@/hooks/use-sync";

export function SyncProvider({ children }: { children: React.ReactNode }) {
  // Initialize sync hook to keep client and server in sync
  useSync();
  return <>{children}</>;
}

