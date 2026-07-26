"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "premium";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
          {
            "bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/10":
              variant === "default",
            "bg-red-600 text-white hover:bg-red-500 shadow-lg shadow-red-500/10":
              variant === "destructive",
            "border border-slate-800 bg-transparent text-slate-200 hover:bg-slate-900 hover:text-white":
              variant === "outline",
            "bg-slate-900 text-slate-100 hover:bg-slate-800 border border-slate-800/50":
              variant === "secondary",
            "hover:bg-slate-900 hover:text-slate-100 text-slate-400":
              variant === "ghost",
            "text-zinc-200 underline-offset-4 hover:underline":
              variant === "link",
            "bg-white text-black hover:bg-zinc-100 shadow-lg shadow-white/5 border border-zinc-200/10":
              variant === "premium",
          },
          {
            "h-11 px-6 py-2": size === "default",
            "h-9 rounded-lg px-4 py-1.5 text-xs": size === "sm",
            "h-12 rounded-xl px-8 text-base": size === "lg",
            "h-10 w-10": size === "icon",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
