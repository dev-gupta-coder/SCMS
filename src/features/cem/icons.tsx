import type { ReactNode, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function BaseIcon({ children, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}
// function BaseIcon({ children, ...props }: IconProps & { children: ReactNode }) {
//   return (
//     <svg viewBox="0 0 24 24" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
//       {children}
//     </svg>
//   )
// }

export function ProductsIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      {/* Top box */}
      <path
        d="M3.5 7.5 12 3l8.5 4.5-8.5 4.5-8.5-4.5Z"
        fill="#FBBF24"
        stroke="#D97706"
        strokeWidth="1"
      />

      {/* Left side */}
      <path
        d="M3.5 7.5V16l8.5 4.5V12L3.5 7.5Z"
        fill="#F59E0B"
        stroke="#D97706"
        strokeWidth="1"
      />

      {/* Right side */}
      <path
        d="M20.5 7.5V16L12 20.5V12l8.5-4.5Z"
        fill="#FCD34D"
        stroke="#D97706"
        strokeWidth="1"
      />

      {/* Tape */}
      <rect x="11" y="4.7" width="2" height="15.3" rx="0.6" fill="#EF4444" />

      {/* Check badge */}
      <circle
        cx="18.2"
        cy="6"
        r="2.3"
        fill="#22C55E"
        stroke="white"
        strokeWidth="0.8"
      />
      <path
        d="M17.2 6l0.7 0.7 1.3-1.4"
        stroke="white"
        strokeWidth="0.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </BaseIcon>
  );
}

// export function LedgerIcon(props: IconProps) {
//   return (
//     <BaseIcon {...props}>
//       <path d="M6 3.5h9l3 3v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-16a1 1 0 0 1 1-1Z" />
//       <path d="M9 9.5h6M9 13h6M9 16.5h4" />
//     </BaseIcon>
//   );
// }

export function LedgerIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      {/* Ledger book */}
      <path
        d="M6 3.5h9l3 3v14a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 20V5A1.5 1.5 0 0 1 6 3.5Z"
        fill="#60A5FA"
        stroke="#2563EB"
        strokeWidth="1"
      />

      {/* Folded corner */}
      <path
        d="M15 3.5v3h3"
        fill="#BFDBFE"
        stroke="#2563EB"
        strokeWidth="1"
      />

      {/* Red spine */}
      <rect
        x="5"
        y="3.5"
        width="2.3"
        height="18"
        rx="1"
        fill="#EF4444"
      />

      {/* Ledger lines */}
      <path
        d="M9.5 9h6M9.5 12h6M9.5 15h6M9.5 18h4"
        stroke="#FFFFFF"
        strokeWidth="1.4"
        strokeLinecap="round"
      />

      {/* Green check badge */}
      <circle
        cx="18.3"
        cy="18.3"
        r="2.2"
        fill="#22C55E"
        stroke="white"
        strokeWidth="0.8"
      />
      <path
        d="M17.5 18.3l0.5 0.6 1.2-1.3"
        stroke="white"
        strokeWidth="0.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </BaseIcon>
  )
}

// export function AlertsIcon(props: IconProps) {
//   return (
//     <BaseIcon {...props}>
//       <path d="M12 3.5c-3.5 0-5 3-5 6.5 0 3.5-1 5-2 6h14c-1-1-2-2.5-2-6 0-3.5-1.5-6.5-5-6.5Z" />
//       <path d="M10 19a2 2 0 0 0 4 0" />
//     </BaseIcon>
//   )
// }
export function AlertsIcon(props: IconProps) {
  return (
    <BaseIcon
      {...props}
      fill="none"
      stroke="#FACC15"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Bell */}
      <path d="M12 3.5c-3.5 0-5 3-5 6.5 0 3.5-1 5-2 6h14c-1-1-2-2.5-2-6 0-3.5-1.5-6.5-5-6.5Z" />

      {/* Clapper */}
      <path d="M10 19a2 2 0 0 0 4 0" />

      {/* Red notification dot */}
      <circle
        cx="18"
        cy="6"
        r="2.2"
        fill="#EF4444"
        stroke="white"
        strokeWidth="1"
      />
    </BaseIcon>
  );
}

// export function NotesIcon(props: IconProps) {
//   return (
//     <BaseIcon {...props}>
//       <path d="M6 3.5h9.5L18 6v14.5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-16a1 1 0 0 1 1-1Z" />
//       <path d="M14.5 3.5V7a1 1 0 0 0 1 1H18" />
//       <path d="M8 12h6M8 15.5h6" />
//     </BaseIcon>
//   )
// }
export function NotesIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      {/* Yellow notebook */}
      <path
        d="M6 3h9l3 3v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
        fill="#FACC15"
      />

      {/* Folded corner */}
      <path d="M15 3v3h3" fill="#EAB308" />

      {/* Red binding */}
      <rect x="5.5" y="3" width="2.4" height="19" rx="1.2" fill="#EF4444" />

      {/* White note lines */}
      <path
        d="M10 8.5h6M10 11.5h6M10 14.5h5M10 17.5h4"
        stroke="#FFFFFF"
        strokeWidth="1.4"
        strokeLinecap="round"
      />

      {/* Green check */}
      <path
        d="M10.2 20l1.5 1.5 3-3"
        stroke="#22C55E"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </BaseIcon>
  );
}

// export function BuildingsIcon(props: IconProps) {
//   return (
//     <BaseIcon {...props}>
//       <path d="M4 20.5V6l7-3 7 3v14.5" />
//       <path d="M4 20.5h16" />
//       <path d="M9.5 20.5v-4h3v4" />
//       <path d="M9 8.5h.01M13 8.5h.01M9 12h.01M13 12h.01" />
//     </BaseIcon>
//   )
// }
export function BuildingsIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <rect x="4" y="4" width="16" height="16" rx="2" fill="#60A5FA" />
      <path d="M4 6L12 2L20 6" fill="#2563EB" />
      <rect x="10" y="14" width="4" height="6" rx="1" fill="#8B5A2B" />
      <rect x="7" y="7" width="2" height="2" fill="#FACC15" />
      <rect x="11" y="7" width="2" height="2" fill="#FACC15" />
      <rect x="15" y="7" width="2" height="2" fill="#FACC15" />
      <rect x="7" y="11" width="2" height="2" fill="#FACC15" />
      <rect x="11" y="11" width="2" height="2" fill="#FACC15" />
      <rect x="15" y="11" width="2" height="2" fill="#FACC15" />
    </BaseIcon>
  );
}
