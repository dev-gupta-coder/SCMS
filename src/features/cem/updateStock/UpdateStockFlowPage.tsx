import { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ConfirmationScreen, toast } from '@/components/ui'
import { LoadingScreen } from '@/components/LoadingScreen'
import { useFloors, useLocationStock } from '../api'
import { useLogConsumption } from './api'
import { StockProductPicker } from '../StockProductPicker'
import { UpdateStockDetailsForm } from './UpdateStockDetailsForm'
import type { StockRow } from '../types'

type Step =
  | { name: 'select' }
  | { name: 'details'; row: StockRow }
  | { name: 'done'; row: StockRow; quantity: string }

/** PRD 11, CEM App screen 6 — Update Stock, available at any location. */
export function UpdateStockFlowPage() {
  const { buildingId } = useParams<{ buildingId: string }>()
  const [searchParams] = useSearchParams()
  const floorId = searchParams.get('loc') ?? ''
  const navigate = useNavigate()

  const { data: floors, isLoading: floorsLoading } = useFloors(buildingId)
  const floor = floors?.find((f) => f.id === floorId)
  const stockQuery = useLocationStock({ type: 'floor', buildingId: buildingId ?? '', floorId })
  const logConsumption = useLogConsumption()

  const [step, setStep] = useState<Step>({ name: 'select' })

  const goBackToCheckIn = () => navigate(`/cem/${buildingId}?loc=${floorId}`, { replace: true })

  if (floorsLoading || stockQuery.isLoading) return <LoadingScreen />
  if (!buildingId || !floor) return null

  const handleSubmit = async (row: StockRow, quantity: string, reason: string) => {
    try {
      await logConsumption.mutateAsync({
        productId: row.product.id,
        buildingId,
        floorId,
        quantity: Number(quantity),
        reason,
      })
      setStep({ name: 'done', row, quantity })
    } catch {
      toast.error('Could not update stock. Try again.')
    }
  }

  if (step.name === 'done') {
    return (
      <ConfirmationScreen
        open
        message="Stock Updated"
        subMessage={`${step.quantity} ${step.row.product.unit} of ${step.row.product.name} logged`}
        onDone={goBackToCheckIn}
      />
    )
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-6">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Update Stock</h1>
      </div>

      {step.name === 'select' && (
        <StockProductPicker rows={stockQuery.data ?? []} onSelect={(row) => setStep({ name: 'details', row })} />
      )}

      {step.name === 'details' && (
        <UpdateStockDetailsForm
          row={step.row}
          submitting={logConsumption.isPending}
          onSubmit={(quantity, reason) => handleSubmit(step.row, quantity, reason)}
        />
      )}
    </div>
  )
}
