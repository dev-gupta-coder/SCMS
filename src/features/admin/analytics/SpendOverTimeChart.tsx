import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartCard } from './ChartCard'
import { CHART_COLOR, useChartTheme } from './chartTheme'
import type { DailySpend } from './aggregate'

export function SpendOverTimeChart({ data }: { data: DailySpend[] }) {
  const chartTheme = useChartTheme()

  return (
    <ChartCard
      title="Spend Over Time"
      tableHeaders={['Date', 'Spend']}
      tableRows={data.map((row) => [row.date, `₹${row.total.toFixed(2)}`])}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
          <CartesianGrid stroke={chartTheme.grid} vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 12, fill: chartTheme.axisText }} />
          <YAxis tick={{ fontSize: 12, fill: chartTheme.axisText }} width={60} />
          <Tooltip
            formatter={(value: number) => [`₹${value.toFixed(2)}`, 'Spend']}
            contentStyle={chartTheme.tooltipStyle}
          />
          <Line
            type="monotone"
            dataKey="total"
            stroke={CHART_COLOR}
            strokeWidth={2}
            dot={{ r: 4, fill: CHART_COLOR, stroke: chartTheme.dotStroke, strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
