import * as React from "react";

type CalendarProps = React.HTMLAttributes<HTMLDivElement> & {
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
};

export function Calendar({ onSelect, ...props }: CalendarProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect?.(new Date())}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          onSelect?.(new Date());
        }
      }}
      {...props}
    />
  );
}
