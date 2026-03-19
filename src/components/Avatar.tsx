import * as React from "react";

type JesseXBTAvatarProps = {
  size?: number;
  className?: string;
  fallbackUrl?: string;
  showLoadingState?: boolean;
  showErrorState?: boolean;
  priority?: boolean;
};

export function JesseXBTAvatar({ size = 32, className, fallbackUrl }: JesseXBTAvatarProps) {
  return (
    <img
      src={fallbackUrl || "/assets/moonxbt/logo.png"}
      alt="JesseXBT"
      width={size}
      height={size}
      className={className}
    />
  );
}
