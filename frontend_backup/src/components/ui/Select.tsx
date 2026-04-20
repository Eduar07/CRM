import type { SelectHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "w-full rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-slate-300",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}
