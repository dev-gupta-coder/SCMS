import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ConfirmationScreen, toast } from '@/components/ui'
import { LoadingScreen } from '@/components/LoadingScreen'
import { useFloors } from '../api'
import { useLogDelivery, useWarehouseProductsForDelivery } from './api'
import { DeliveryProductPicker } from './DeliveryProductPicker'
import { DeliveryDetailsForm } from './DeliveryDetailsForm'
import type { DeliveryProduct } from './types'

type Step =
  | { name: 'select' }
  | { name: 'details'; product: DeliveryProduct }
  | { name: 'done'; product: DeliveryProduct; quantity: string }

/** PRD 11, CEM App screen 5 — Delivery Arrived (warehouse only). */
export function DeliveryFlowPage() {
  const { buildingId } = useParams<{ buildingId: string }>()
  const navigate = useNavigate()

  const { data: floors, isLoading: floorsLoading } = useFloors(buildingId)
  const warehouse = floors?.find((f) => f.floor_type === 'warehouse')
  const { data: products, isLoading: productsLoading } = useWarehouseProductsForDelivery(buildingId, warehouse?.id)
  const logDelivery = useLogDelivery()

  const [step, setStep] = useState<Step>({ name: 'select' })

  const goBackToCheckIn = () => {
    navigate(`/cem/${buildingId}?loc=${warehouse?.id ?? ''}`, { replace: true })
  }

  if (floorsLoading || productsLoading) return <LoadingScreen />
  if (!buildingId || !warehouse) return null

  const handleSubmit = async (product: DeliveryProduct, quantity: string, pricePerUnit: string) => {
    try {
      await logDelivery.mutateAsync({
        productId: product.id,
        buildingId,
        floorId: warehouse.id,
        quantity: Number(quantity),
        pricePerUnit: Number(pricePerUnit),
      })
      setStep({ name: 'done', product, quantity })
    } catch {
      toast.error('Could not log delivery. Try again.')
    }
  }

  if (step.name === 'done') {
    return (
      <ConfirmationScreen
        open
        message="Delivery Logged"
        subMessage={`${step.quantity} ${step.product.unit} of ${step.product.name} added to Warehouse`}
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
          className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Back
        </button>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Delivery Arrived</h1>
      </div>

      {step.name === 'select' && (
        <DeliveryProductPicker products={products ?? []} onSelect={(product) => setStep({ name: 'details', product })} />
      )}

      {step.name === 'details' && (
        <DeliveryDetailsForm
          product={step.product}
          submitting={logDelivery.isPending}
          onSubmit={(quantity, price) => handleSubmit(step.product, quantity, price)}
        />
      )}
    </div>
  )
}
