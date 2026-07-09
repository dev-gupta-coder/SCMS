import type { BuildingReportGroup } from './aggregate'

const BOM = String.fromCharCode(0xfeff)

function escapeCsvCell(value: string | number): string {
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function toRow(cells: (string | number)[]): string {
  return cells.map(escapeCsvCell).join(',')
}

/**
 * A CSV opens natively in Excel and needs no extra dependency. The two
 * client-side "Excel" libraries evaluated (xlsx, exceljs) both carry
 * unresolved CVEs in this project's dependency tree — xlsx has two
 * high-severity advisories with no fix available; exceljs pulls in a
 * vulnerable transitive `uuid`. Neither is worth taking on for a flat,
 * grouped report with no formulas or multiple sheets.
 */
export function buildReportCsv(groups: BuildingReportGroup[], grandTotalValue: number): string {
  const lines: string[] = []

  for (const group of groups) {
    lines.push(toRow([`Building: ${group.buildingName}`]))
    lines.push(toRow(['Date', 'Product', 'Quantity', 'Unit', 'Price/Unit', 'Total Price']))
    for (const row of group.rows) {
      lines.push(
        toRow([
          new Date(row.logged_at).toLocaleDateString(),
          row.product.name,
          row.quantity,
          row.product.unit,
          (row.price_per_unit ?? 0).toFixed(2),
          (row.total_price ?? 0).toFixed(2),
        ]),
      )
    }
    lines.push(toRow(['', '', '', '', 'Subtotal', group.subtotal.toFixed(2)]))
    lines.push('')
  }

  lines.push(toRow(['', '', '', '', 'Grand Total', grandTotalValue.toFixed(2)]))

  return lines.join('\r\n')
}

export function downloadCsv(filename: string, csvContent: string) {
  // Leading BOM so Excel opens the UTF-8 file with the right encoding (₹, etc.) instead of mojibake.
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
