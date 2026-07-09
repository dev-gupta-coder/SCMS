import { useThemeStore } from '@/store/themeStore'

// Every chart on this page is one metric broken out by category or time —
// never multiple series in one plot — so the "compare magnitude" /
// "trend over time" color job is a single hue, not a categorical palette
// (see dataviz skill: color-formula.md). Reusing the existing brand accent
// keeps this compliant with "don't invent new brand colors" (CLAUDE.md #7).
export const CHART_COLOR = '#6500D6'

interface ChartTheme {
  grid: string
  axisText: string
  tooltipStyle: { backgroundColor: string; borderRadius: number; borderColor: string; color: string }
  /** Ring drawn around line-chart dots — matches the card surface so it reads as a gap, not a halo. */
  dotStroke: string
}

const CHART_THEME: Record<'light' | 'dark', ChartTheme> = {
  light: {
    grid: '#e5e7eb',
    axisText: '#9ca3af',
    tooltipStyle: { backgroundColor: '#ffffff', borderRadius: 8, borderColor: '#e5e7eb', color: '#111827' },
    dotStroke: '#ffffff',
  },
  dark: {
    grid: '#374151',
    axisText: '#9ca3af',
    tooltipStyle: { backgroundColor: '#111827', borderRadius: 8, borderColor: '#374151', color: '#f3f4f6' },
    dotStroke: '#111827',
  },
}

/** Recharts renders via SVG props, not Tailwind classes — this is the one place chart colors branch on theme. */
export function useChartTheme(): ChartTheme {
  const theme = useThemeStore((state) => state.theme)
  return CHART_THEME[theme]
}
