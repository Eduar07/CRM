import type { InputHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "w-full rounded-2xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-slate-300",
        className
      )}
      {...props}
    />
  );
}
