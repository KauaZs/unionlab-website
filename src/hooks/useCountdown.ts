"use client";

import { useEffect, useState } from "react";

function format(ms: number) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return [h, m, s].map((n) => n.toString().padStart(2, "0")).join(":");
}

/** "HH:MM:SS" until `expiresAt` (epoch ms), or null once it has passed. */
export function useCountdown(expiresAt: number | null | undefined) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!expiresAt || expiresAt <= Date.now()) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  if (!expiresAt) return null;
  const remaining = expiresAt - now;
  return remaining > 0 ? format(remaining) : null;
}
