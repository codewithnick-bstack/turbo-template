import * as React from "react";

import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-slate-200/80 bg-white/85 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/80",
        className,
      )}
      {...props}
    />
  );
}
