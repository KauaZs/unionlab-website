"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500",
        {
          "border-transparent bg-blue-600/10 text-blue-400 border-blue-500/20": variant === "default",
          "border-transparent bg-slate-800 text-slate-300": variant === "secondary",
          "border-transparent bg-red-500/10 text-red-400 border-red-500/20": variant === "destructive",
          "border-slate-800 text-slate-300 bg-transparent": variant === "outline",
          "border-transparent bg-emerald-500/10 text-emerald-400 border-emerald-500/20": variant === "success",
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };
