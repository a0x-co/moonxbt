import * as React from "react";

type DivProps = React.HTMLAttributes<HTMLDivElement> & {
  children?: React.ReactNode;
};

type TriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  children?: React.ReactNode;
};

export function Popover({ children }: DivProps) {
  return <>{children}</>;
}

export function PopoverTrigger({ children, ...props }: TriggerProps) {
  return (
    <button type="button" {...props}>
      {children}
    </button>
  );
}

export function PopoverContent({ children, ...props }: DivProps) {
  return <div {...props}>{children}</div>;
}
