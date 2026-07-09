import { useNavigate, useParams } from 'react-router-dom'
import { toast } from '@/components/ui'
import { LoadingScreen } from '@/components/LoadingScreen'
import { isDuplicateNameError, useCreateProduct, useProducts } from './api'
import { ProductForm } from './ProductForm'
import type { ProductFormValues } from './ProductForm'

export function AddProductPage() {
  const { buildingId } = useParams<{ buildingId: string }>()
  const navigate = useNavigate()
  const { data: products, isLoading } = useProducts(buildingId)
  const createProduct = useCreateProduct()

  if (isLoading) return <LoadingScreen />
  if (!buildingId) return null

  const handleSubmit = async (values: ProductFormValues) => {
    try {
      await createProduct.mutateAsync({
        buildingId,
        name: values.name.trim(),
        model: values.model.trim() || null,
        category: values.category,
        unit: values.unit,
        priority: values.priority,
        vendorName: values.vendorName.trim() || null,
        pricePerUnit: Number(values.pricePerUnit) || 0,
        lowStockThreshold: values.lowStockThreshold === '' ? null : Number(values.lowStockThreshold),
      })
      toast.success('Product added.')
      navigate(`/cem/${buildingId}/products`, { replace: true })
    } catch (err) {
      toast.error(
        isDuplicateNameError(err)
          ? 'A product with this name already exists in this building.'
          : 'Could not add product. Try again.',
      )
    }
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(`/cem/${buildingId}/products`)}
          className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Back
        </button>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Add Product</h1>
      </div>

      <ProductForm
        initialValues={{
          name: '',
          model: '',
          category: '',
          unit: '',
          priority: '',
          vendorName: '',
          pricePerUnit: '',
          lowStockThreshold: '',
        }}
        submitLabel="Add Product"
        submitting={createProduct.isPending}
        existingProducts={products ?? []}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
