import * as React from "react";
import { cn } from "@/lib/utils";

export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
}

const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  ({ className, orientation = "horizontal", ...props }, ref) => (
    <div
      ref={ref}
      role="separator"
      className={cn(
        orientation === "vertical"
          ? "w-px h-8 bg-muted"
          : "h-px w-full bg-muted my-4",
        className
      )}
      {...props}
    />
  )
);
Separator.displayName = "Separator";

export { Separator }; 