import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from '@/components/ui'
import { isDuplicateNameError, useCreateProduct, useLinkProductToBuilding } from './api'
import { ProductForm } from './ProductForm'
import type { ProductFormValues } from './ProductForm'
import type { ProductSearchResult } from './types'

export function AddProductPage() {
  const { buildingId } = useParams<{ buildingId: string }>()
  const navigate = useNavigate()
  const createProduct = useCreateProduct()
  const linkExisting = useLinkProductToBuilding()
  const [linkingProductId, setLinkingProductId] = useState<string | null>(null)

  if (!buildingId) return null

  const handleSubmit = async (values: ProductFormValues) => {
    try {
      await createProduct.mutateAsync({
        buildingId,
        name: values.name.trim(),
        model: values.model.trim() || null,
        category: values.category,
        unit: values.unit,
        vendorName: values.vendorName.trim() || null,
        pricePerUnit: Number(values.pricePerUnit) || 0,
        lowStockThreshold: values.lowStockThreshold === '' ? null : Number(values.lowStockThreshold),
      })
      toast.success('Product added.')
      navigate(`/cem/${buildingId}/products`, { replace: true })
    } catch (err) {
      toast.error(
        isDuplicateNameError(err)
          ? 'A product with this name and model already exists — use the matches list above to link it to your building instead.'
          : 'Could not add product. Try again.',
      )
    }
  }

  const handleLinkExisting = async (product: ProductSearchResult) => {
    setLinkingProductId(product.id)
    try {
      await linkExisting.mutateAsync({ buildingId, productId: product.id, lowStockThreshold: null })
      toast.success(`"${product.name}" linked to this building.`)
      navigate(`/cem/${buildingId}/products/${product.id}/edit`, { replace: true })
    } catch {
      toast.error('Could not link product. Try again.')
    } finally {
      setLinkingProductId(null)
    }
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-6">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Add Product</h1>
      </div>

      <ProductForm
        buildingId={buildingId}
        initialValues={{
          name: '',
          model: '',
          category: '',
          unit: '',
          vendorName: '',
          pricePerUnit: '',
          lowStockThreshold: '',
        }}
        submitLabel="Add Product"
        submitting={createProduct.isPending}
        onLinkExisting={handleLinkExisting}
        linkingProductId={linkingProductId}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
