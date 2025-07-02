import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "outline";
}

const badgeVariants = {
  default: "inline-flex items-center rounded-full bg-blue-100 text-blue-800 px-3 py-0.5 text-xs font-semibold",
  secondary: "inline-flex items-center rounded-full bg-gray-100 text-gray-800 px-3 py-0.5 text-xs font-semibold",
  outline: "inline-flex items-center rounded-full border border-blue-600 text-blue-700 px-3 py-0.5 text-xs font-semibold bg-transparent",
};

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <span
      ref={ref}
      className={cn(badgeVariants[variant], className)}
      {...props}
    />
  )
);
Badge.displayName = "Badge";

export { Badge }; 