"use client";

import { useEffect, useCallback } from "react";
import { useApiBuilderStore } from "@/lib/store";

export function useSync() {
  const { collections, items } = useApiBuilderStore();

  const syncToServer = useCallback(async () => {
    try {
      await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collections, items }),
      });
    } catch (error) {
      console.error("Failed to sync to server:", error);
    }
  }, [collections, items]);

  // Sync whenever collections or items change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      syncToServer();
    }, 500); // Debounce sync

    return () => clearTimeout(timeoutId);
  }, [collections, items, syncToServer]);

  return { syncToServer };
}

