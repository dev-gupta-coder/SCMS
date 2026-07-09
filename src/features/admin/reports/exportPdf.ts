import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { BuildingReportGroup } from './aggregate'

// jspdf-autotable attaches this at runtime; its bundled types leave jsPDFDocument as `any` and don't declare it.
function getLastAutoTableFinalY(doc: jsPDF): number {
  return (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY
}

const CANVAS_PURPLE: [number, number, number] = [101, 0, 214]

export function buildAndDownloadReportPdf(
  groups: BuildingReportGroup[],
  grandTotalValue: number,
  rangeLabel: string,
  filename: string,
) {
  const doc = new jsPDF()

  doc.setFontSize(14)
  doc.text('Purchase / Delivery Report', 14, 16)
  doc.setFontSize(10)
  doc.setTextColor(120)
  doc.text(rangeLabel, 14, 22)
  doc.setTextColor(0)

  let cursorY = 28

  for (const group of groups) {
    doc.setFontSize(11)
    doc.text(group.buildingName, 14, cursorY)

    autoTable(doc, {
      startY: cursorY + 3,
      head: [['Date', 'Product', 'Qty', 'Unit', 'Price/Unit', 'Total']],
      body: group.rows.map((row) => [
        new Date(row.logged_at).toLocaleDateString(),
        row.product.name,
        row.quantity,
        row.product.unit,
        `Rs. ${(row.price_per_unit ?? 0).toFixed(2)}`,
        `Rs. ${(row.total_price ?? 0).toFixed(2)}`,
      ]),
      foot: [['', '', '', '', 'Subtotal', `Rs. ${group.subtotal.toFixed(2)}`]],
      styles: { fontSize: 9 },
      headStyles: { fillColor: CANVAS_PURPLE },
      margin: { left: 14, right: 14 },
    })

    cursorY = getLastAutoTableFinalY(doc) + 10
  }

  doc.setFontSize(11)
  doc.text(`Grand Total: Rs. ${grandTotalValue.toFixed(2)}`, 14, cursorY)

  doc.save(filename)
}
