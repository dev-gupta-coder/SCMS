import { useEffect } from 'react'
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { Toaster } from '@/components/ui'
import { useAuthStore } from '@/store/authStore'
import { LoginPage } from '@/features/auth/LoginPage'
import { ChangePasswordPage } from '@/features/auth/ChangePasswordPage'
import { AuthedHome } from '@/features/auth/AuthedHome'
import { RequireRole } from '@/features/auth/RequireRole'
import { RoleRedirect } from '@/features/auth/RoleRedirect'
import { BuildingGatePage } from '@/features/cem/BuildingGatePage'
import { CheckInPage } from '@/features/cem/CheckInPage'
import { DeliveryFlowPage } from '@/features/cem/delivery/DeliveryFlowPage'
import { UpdateStockFlowPage } from '@/features/cem/updateStock/UpdateStockFlowPage'
import { TransferFlowPage } from '@/features/cem/transfer/TransferFlowPage'
import { ProductListPage } from '@/features/cem/products/ProductListPage'
import { AddProductPage } from '@/features/cem/products/AddProductPage'
import { EditProductPage } from '@/features/cem/products/EditProductPage'

export default function App() {
  const initialize = useAuthStore((state) => state.initialize)

  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<RoleRedirect />} />
        <Route
          path="/admin"
          element={
            <RequireRole role="admin">
              <AuthedHome />
            </RequireRole>
          }
        />
        <Route
          path="/cem"
          element={
            <RequireRole role="cem">
              <Outlet />
            </RequireRole>
          }
        >
          <Route index element={<BuildingGatePage />} />
          <Route path=":buildingId" element={<CheckInPage />} />
          <Route path=":buildingId/delivery" element={<DeliveryFlowPage />} />
          <Route path=":buildingId/update-stock" element={<UpdateStockFlowPage />} />
          <Route path=":buildingId/transfer" element={<TransferFlowPage />} />
          <Route path=":buildingId/products" element={<ProductListPage />} />
          <Route path=":buildingId/products/new" element={<AddProductPage />} />
          <Route path=":buildingId/products/:productId/edit" element={<EditProductPage />} />
        </Route>
        <Route
          path="/change-password"
          element={
            <RequireRole>
              <ChangePasswordPage />
            </RequireRole>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  )
}
