import * as React from "react";
import { cn } from "@/lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  size?: number;
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ src, alt, size = 48, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-muted overflow-hidden",
        className
      )}
      style={{ width: size, height: size }}
      {...props}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="object-cover w-full h-full rounded-full"
        />
      ) : (
        <span className="text-muted-foreground text-xl font-bold">?</span>
      )}
    </div>
  )
);
Avatar.displayName = "Avatar";

export { Avatar }; 