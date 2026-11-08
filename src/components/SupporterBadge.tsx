import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";

/** Marks an active UNION+ subscriber next to their name. */
export default function SupporterBadge({ className }: { className?: string }) {
  return (
    <span
      title="Apoiador UNION+"
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full bg-gradient-to-r from-sky-200 to-blue-400 px-1.5 py-0.5 align-middle text-[9px] font-black leading-none tracking-wide text-blue-950",
        className
      )}
    >
      <Crown className="h-2.5 w-2.5" />
      UNION+
    </span>
  );
}
