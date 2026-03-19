import * as React from "react";

type DivProps = React.HTMLAttributes<HTMLDivElement> & {
  children?: React.ReactNode;
  align?: string;
  side?: string;
  sideOffset?: number;
};

type TriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  children?: React.ReactNode;
};

export function DropdownMenu({ children }: DivProps) {
  return <>{children}</>;
}

export function DropdownMenuTrigger({ children, ...props }: TriggerProps) {
  return (
    <button type="button" {...props}>
      {children}
    </button>
  );
}

export function DropdownMenuContent({ children, ...props }: DivProps) {
  return <div {...props}>{children}</div>;
}

export function DropdownMenuItem({ children, ...props }: DivProps) {
  return (
    <div role="menuitem" {...props}>
      {children}
    </div>
  );
}
