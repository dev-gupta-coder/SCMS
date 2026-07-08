import { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ConfirmationScreen, toast } from '@/components/ui'
import { LoadingScreen } from '@/components/LoadingScreen'
import { useFloors, useLocationStock } from '../api'
import { StockProductPicker } from '../StockProductPicker'
import { useLogTransfer } from './api'
import { TransferDetailsForm } from './TransferDetailsForm'
import type { StockRow } from '../types'

type Step =
  | { name: 'select' }
  | { name: 'details'; row: StockRow }
  | { name: 'done'; row: StockRow; quantity: string; toFloorName: string }

/** PRD 11, CEM App screen 7 — Transfer Stock, available at any location. */
export function TransferFlowPage() {
  const { buildingId } = useParams<{ buildingId: string }>()
  const [searchParams] = useSearchParams()
  const fromFloorId = searchParams.get('loc') ?? ''
  const navigate = useNavigate()

  const { data: floors, isLoading: floorsLoading } = useFloors(buildingId)
  const fromFloor = floors?.find((f) => f.id === fromFloorId)
  const stockQuery = useLocationStock({ type: 'floor', floorId: fromFloorId })
  const logTransfer = useLogTransfer()

  const [step, setStep] = useState<Step>({ name: 'select' })

  const goBackToCheckIn = () => navigate(`/cem/${buildingId}?loc=${fromFloorId}`, { replace: true })

  if (floorsLoading || stockQuery.isLoading) return <LoadingScreen />
  if (!buildingId || !fromFloor) return null

  const handleSubmit = async (row: StockRow, quantity: string, toFloorId: string) => {
    const toFloor = floors?.find((f) => f.id === toFloorId)
    try {
      await logTransfer.mutateAsync({
        productId: row.product.id,
        buildingId,
        fromFloorId,
        toFloorId,
        quantity: Number(quantity),
      })
      setStep({
        name: 'done',
        row,
        quantity,
        toFloorName: toFloor ? (toFloor.floor_type === 'warehouse' ? 'Warehouse' : toFloor.name) : 'destination',
      })
    } catch {
      toast.error('Could not log transfer. Try again.')
    }
  }

  if (step.name === 'done') {
    return (
      <ConfirmationScreen
        open
        message="Transfer Logged"
        subMessage={`${step.quantity} ${step.row.product.unit} of ${step.row.product.name} moved to ${step.toFloorName}`}
        onDone={goBackToCheckIn}
      />
    )
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => (step.name === 'details' ? setStep({ name: 'select' }) : goBackToCheckIn())}
          className="text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          Back
        </button>
        <h1 className="text-xl font-semibold text-gray-900">Transfer Stock</h1>
      </div>

      {step.name === 'select' && (
        <StockProductPicker rows={stockQuery.data ?? []} onSelect={(row) => setStep({ name: 'details', row })} />
      )}

      {step.name === 'details' && floors && (
        <TransferDetailsForm
          row={step.row}
          sourceFloorId={fromFloorId}
          floors={floors}
          submitting={logTransfer.isPending}
          onSubmit={(quantity, toFloorId) => handleSubmit(step.row, quantity, toFloorId)}
        />
      )}
    </div>
  )
}
