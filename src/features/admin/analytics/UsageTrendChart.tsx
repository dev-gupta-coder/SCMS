import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartCard } from './ChartCard'
import { CHART_COLOR, useChartTheme } from './chartTheme'
import type { DailyUsage } from './aggregate'

export function UsageTrendChart({ data }: { data: DailyUsage[] }) {
  const chartTheme = useChartTheme()

  return (
    <ChartCard
      title="Usage Trend"
      subtitle="Total quantity consumed per day, summed across all products regardless of unit."
      tableHeaders={['Date', 'Quantity Consumed']}
      tableRows={data.map((row) => [row.date, row.quantity])}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
          <CartesianGrid stroke={chartTheme.grid} vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 12, fill: chartTheme.axisText }} />
          <YAxis tick={{ fontSize: 12, fill: chartTheme.axisText }} width={50} />
          <Tooltip contentStyle={chartTheme.tooltipStyle} />
          <Line
            type="monotone"
            dataKey="quantity"
            stroke={CHART_COLOR}
            strokeWidth={2}
            dot={{ r: 4, fill: CHART_COLOR, stroke: chartTheme.dotStroke, strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
