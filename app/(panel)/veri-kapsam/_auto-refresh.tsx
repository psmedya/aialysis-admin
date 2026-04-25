"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Server component'i belirli aralikla tazeler.
 * `router.refresh()` cache'i invalidate edip RSC'i yeniden cizdirir.
 */
export function CoverageAutoRefresh({ seconds = 60 }: { seconds?: number }) {
  const router = useRouter();

  useEffect(() => {
    const id = window.setInterval(() => {
      router.refresh();
    }, seconds * 1000);
    return () => window.clearInterval(id);
  }, [router, seconds]);

  return null;
}
