import type { ReactNode, SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

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
  )
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
      <path d="M3.5 7.5 12 3l8.5 4.5-8.5 4.5-8.5-4.5Z" />
      <path d="M3.5 7.5V16l8.5 4.5 8.5-4.5V7.5" />
      <path d="M12 12v8.5" />
    </BaseIcon>
  )
}

export function LedgerIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M6 3.5h9l3 3v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-16a1 1 0 0 1 1-1Z" />
      <path d="M9 9.5h6M9 13h6M9 16.5h4" />
    </BaseIcon>
  )
}

export function AlertsIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 3.5c-3.5 0-5 3-5 6.5 0 3.5-1 5-2 6h14c-1-1-2-2.5-2-6 0-3.5-1.5-6.5-5-6.5Z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </BaseIcon>
  )
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
      <path d="M6 3h9l3 3v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" fill="#FDE68A" />
      <path d="M15 3v3h3" fill="#FBBF24" />
      <rect x="6" y="3" width="2.2" height="19" rx="1" fill="#EF4444" />
      <path d="M9.5 9h6M9.5 12h6M9.5 15h5M9.5 18h4" stroke="#2563EB" strokeWidth="1.3" strokeLinecap="round" />
    </BaseIcon>
  )
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
      <rect x="7" y="7" width="2" height="2" fill="#FACC15" /><rect x="11" y="7" width="2" height="2" fill="#FACC15" /><rect x="15" y="7" width="2" height="2" fill="#FACC15" />
      <rect x="7" y="11" width="2" height="2" fill="#FACC15" /><rect x="11" y="11" width="2" height="2" fill="#FACC15" /><rect x="15" y="11" width="2" height="2" fill="#FACC15" />
    </BaseIcon>
  )
}