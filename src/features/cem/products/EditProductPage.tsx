import { useNavigate, useParams } from 'react-router-dom'
import { toast } from '@/components/ui'
import { LoadingScreen } from '@/components/LoadingScreen'
import { isDuplicateNameError, useProduct, useProducts, useUpdateProduct } from './api'
import { ProductForm } from './ProductForm'
import type { ProductFormValues } from './ProductForm'

export function EditProductPage() {
  const { buildingId, productId } = useParams<{ buildingId: string; productId: string }>()
  const navigate = useNavigate()
  const { data: product, isLoading: productLoading } = useProduct(productId)
  const { data: products, isLoading: productsLoading } = useProducts(buildingId)
  const updateProduct = useUpdateProduct()

  if (productLoading || productsLoading) return <LoadingScreen />
  if (!buildingId || !productId || !product) return null

  const handleSubmit = async (values: ProductFormValues) => {
    try {
      await updateProduct.mutateAsync({
        productId,
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
      toast.success('Product updated.')
      navigate(`/cem/${buildingId}/products`, { replace: true })
    } catch (err) {
      toast.error(
        isDuplicateNameError(err)
          ? 'A product with this name already exists in this building.'
          : 'Could not update product. Try again.',
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
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Edit Product</h1>
      </div>

      <ProductForm
        initialValues={{
          name: product.name,
          model: product.model ?? '',
          category: product.category,
          unit: product.unit,
          priority: product.priority,
          vendorName: product.vendor_name ?? '',
          pricePerUnit: String(product.current_price_per_unit),
          lowStockThreshold: product.low_stock_threshold == null ? '' : String(product.low_stock_threshold),
        }}
        submitLabel="Save Changes"
        submitting={updateProduct.isPending}
        existingProducts={products ?? []}
        excludeProductId={productId}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
