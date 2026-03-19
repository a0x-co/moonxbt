import * as React from "react";
import { Avatar as BaseAvatar } from "../ui/avatar";
import { cn } from "@/lib/utils";

type AvatarImageProps = React.ImgHTMLAttributes<HTMLImageElement>;
type AvatarFallbackProps = React.HTMLAttributes<HTMLSpanElement>;

export const Avatar = BaseAvatar;

export function AvatarImage({ className, ...props }: AvatarImageProps) {
	return <img className={cn("h-full w-full object-cover rounded-full", className)} {...props} />;
}

export function AvatarFallback({ className, ...props }: AvatarFallbackProps) {
	return <span className={cn("text-xs font-medium text-slate-500", className)} {...props} />;
}
