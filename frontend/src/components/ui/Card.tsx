import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className }: CardProps) {
  return <div className={cn("rounded-3xl border bg-white p-5 shadow-sm", className)}>{children}</div>;
}
