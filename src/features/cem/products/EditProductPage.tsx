import { useNavigate, useParams } from 'react-router-dom'
import { toast } from '@/components/ui'
import { LoadingScreen } from '@/components/LoadingScreen'
import { isDuplicateNameError, useProduct, useUpdateProduct } from './api'
import { ProductForm } from './ProductForm'
import type { ProductFormValues } from './ProductForm'

/**
 * Global Products (CLAUDE.md): any CEM with a building assignment can edit
 * this product's global fields, not just its creator — enforced by RLS
 * ("Assigned CEMs edit products", migration 0008), which this screen
 * relies on rather than duplicating with a client-side ownership check.
 */
export function EditProductPage() {
  const { buildingId, productId } = useParams<{ buildingId: string; productId: string }>()
  const navigate = useNavigate()
  const { data: product, isLoading: productLoading } = useProduct(buildingId, productId)
  const updateProduct = useUpdateProduct()

  if (productLoading) return <LoadingScreen />
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
        vendorName: values.vendorName.trim() || null,
        pricePerUnit: Number(values.pricePerUnit) || 0,
        lowStockThreshold: values.lowStockThreshold === '' ? null : Number(values.lowStockThreshold),
      })
      toast.success('Product updated.')
      navigate(`/cem/${buildingId}/products`, { replace: true })
    } catch (err) {
      toast.error(
        isDuplicateNameError(err)
          ? 'Another product with this name and model already exists in the catalog.'
          : 'Could not update product. Try again.',
      )
    }
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-6">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Edit Product</h1>
      </div>

      <ProductForm
        buildingId={buildingId}
        initialValues={{
          name: product.name,
          model: product.model ?? '',
          category: product.category,
          unit: product.unit,
          vendorName: product.vendor_name ?? '',
          pricePerUnit: String(product.current_price_per_unit),
          lowStockThreshold: product.low_stock_threshold == null ? '' : String(product.low_stock_threshold),
        }}
        submitLabel="Save Changes"
        submitting={updateProduct.isPending}
        excludeProductId={productId}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
