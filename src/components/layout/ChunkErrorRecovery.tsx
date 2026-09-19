"use client";

import { useEffect } from "react";

export function ChunkErrorRecovery() {
  useEffect(() => {
    const handleChunkError = (event: ErrorEvent) => {
      const errorMsg = event.message || event.error?.message || "";
      if (
        errorMsg.includes("Loading chunk") ||
        errorMsg.includes("ChunkLoadError") ||
        errorMsg.includes("failed to load")
      ) {
        // Automatically reload page to fetch latest compiled bundle
        console.warn("ChunkLoadError detected. Reloading page for latest static bundle...");
        window.location.reload();
      }
    };

    window.addEventListener("error", handleChunkError);
    return () => window.removeEventListener("error", handleChunkError);
  }, []);

  return null;
}
