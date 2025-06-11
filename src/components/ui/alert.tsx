import * as React from "react";
import { cn } from "@/lib/utils";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive" | "success";
}

const alertVariants = {
  default: "bg-blue-50 text-blue-800 border border-blue-200",
  destructive: "bg-red-50 text-red-800 border border-red-200",
  success: "bg-green-50 text-green-800 border border-green-200",
};

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-lg px-4 py-3 text-sm font-medium",
        alertVariants[variant],
        className
      )}
      {...props}
    />
  )
);
Alert.displayName = "Alert";

export { Alert }; 