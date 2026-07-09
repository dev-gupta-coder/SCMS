import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartCard } from './ChartCard'
import { CHART_COLOR, useChartTheme } from './chartTheme'
import type { ProductUsage } from './aggregate'

export function TopConsumedProductsChart({ data }: { data: ProductUsage[] }) {
  const chartTheme = useChartTheme()

  return (
    <ChartCard
      title="Top Consumed Products"
      subtitle="Quantities are in each product's own unit — not directly comparable across units."
      tableHeaders={['Product', 'Quantity', 'Unit']}
      tableRows={data.map((row) => [row.product, row.quantity, row.unit])}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
          <CartesianGrid stroke={chartTheme.grid} horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 12, fill: chartTheme.axisText }} />
          <YAxis type="category" dataKey="product" tick={{ fontSize: 12, fill: chartTheme.axisText }} width={140} />
          <Tooltip
            formatter={(value, _name, item) => [`${value} ${(item.payload as ProductUsage).unit}`, 'Consumed']}
            contentStyle={chartTheme.tooltipStyle}
          />
          <Bar dataKey="quantity" fill={CHART_COLOR} radius={[0, 4, 4, 0]} maxBarSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
