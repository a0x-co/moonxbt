import * as React from "react";

type FarcasterIconProps = React.SVGProps<SVGSVGElement>;

export default function FarcasterIcon(props: FarcasterIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M6 4h12v16H6z" stroke="currentColor" strokeWidth="2" />
      <path
        d="M9 9l3 3 3-3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 12v5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
