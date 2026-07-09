import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartCard } from './ChartCard'
import { CHART_COLOR, useChartTheme } from './chartTheme'
import type { BuildingSpend } from './aggregate'

export function SpendByBuildingChart({ data }: { data: BuildingSpend[] }) {
  const chartTheme = useChartTheme()

  return (
    <ChartCard
      title="Spend by Building"
      tableHeaders={['Building', 'Spend']}
      tableRows={data.map((row) => [row.building, `₹${row.total.toFixed(2)}`])}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 24 }}>
          <CartesianGrid stroke={chartTheme.grid} vertical={false} />
          <XAxis
            dataKey="building"
            tick={{ fontSize: 11, fill: chartTheme.axisText }}
            interval={0}
            angle={-20}
            textAnchor="end"
            height={50}
          />
          <YAxis tick={{ fontSize: 12, fill: chartTheme.axisText }} width={60} />
          <Tooltip
            formatter={(value: number) => [`₹${value.toFixed(2)}`, 'Spend']}
            contentStyle={chartTheme.tooltipStyle}
          />
          <Bar dataKey="total" fill={CHART_COLOR} radius={[4, 4, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
