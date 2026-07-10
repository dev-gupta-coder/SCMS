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

export function OverviewIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.2" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.2" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.2" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.2" />
    </BaseIcon>
  )
}

export function AnalyticsIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M4 20V10M10 20V4M16 20v-7M20 20v-4" />
    </BaseIcon>
  )
}

export function BuildingsIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M4 20.5V6l7-3 7 3v14.5" />
      <path d="M4 20.5h16" />
      <path d="M9.5 20.5v-4h3v4" />
      <path d="M9 8.5h.01M13 8.5h.01M9 12h.01M13 12h.01" />
    </BaseIcon>
  )
}

export function CemsIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
      <circle cx="17" cy="9" r="2.3" />
      <path d="M15 20a4.2 4.2 0 0 1 6.5-3.5" />
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

export function CatalogIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H18a2 2 0 0 1 2 2v14l-3-1.6-3 1.6-3-1.6-3 1.6-3-1.6-1 0.5Z" />
      <path d="M8 9h8M8 12.5h8" />
    </BaseIcon>
  )
}

export function ReportsIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M7 3.5h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-16a1 1 0 0 1 1-1Z" />
      <path d="M14 3.5V7a1 1 0 0 0 1 1h4" />
      <path d="M9 13l2 2 4-4" />
    </BaseIcon>
  )
}
