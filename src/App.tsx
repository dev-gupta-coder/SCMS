import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AdminShell } from '@/features/admin/AdminShell'
import { CemShell } from '@/features/cem/CemShell'
import { Toaster } from '@/components/ui'
import { useAuthStore } from '@/store/authStore'
import { LoginPage } from '@/features/auth/LoginPage'
import { ChangePasswordPage } from '@/features/auth/ChangePasswordPage'
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
import { LedgerPage } from '@/features/cem/ledger/LedgerPage'
import { AlertsPage } from '@/features/cem/alerts/AlertsPage'
import { NotePage } from '@/features/cem/note/NotePage'
import { OverviewDashboardPage } from '@/features/admin/OverviewDashboardPage'
import { ManageBuildingsPage } from '@/features/admin/buildings/ManageBuildingsPage'
import { AddBuildingPage } from '@/features/admin/buildings/AddBuildingPage'
import { BuildingManagePage } from '@/features/admin/buildings/BuildingManagePage'
import { BuildingDetailPage } from '@/features/admin/buildingDetail/BuildingDetailPage'
import { ManageCemsPage } from '@/features/admin/cem/ManageCemsPage'
import { CreateCemAccountPage } from '@/features/admin/cem/CreateCemAccountPage'
import { ProductCatalogPage } from '@/features/admin/products/ProductCatalogPage'
import { LedgerHistoryPage } from '@/features/admin/ledgerHistory/LedgerHistoryPage'
import { AnalyticsPage } from '@/features/admin/analytics/AnalyticsPage'
import { ReportsPage } from '@/features/admin/reports/ReportsPage'

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
              <AdminShell />
            </RequireRole>
          }
        >
          <Route index element={<OverviewDashboardPage />} />
          <Route path="buildings" element={<ManageBuildingsPage />} />
          <Route path="buildings/new" element={<AddBuildingPage />} />
          <Route path="buildings/:buildingId/manage" element={<BuildingManagePage />} />
          <Route path="buildings/:buildingId" element={<BuildingDetailPage />} />
          <Route path="cems" element={<ManageCemsPage />} />
          <Route path="cems/new" element={<CreateCemAccountPage />} />
          <Route path="products" element={<ProductCatalogPage />} />
          <Route path="ledger" element={<LedgerHistoryPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="reports" element={<ReportsPage />} />
        </Route>
        <Route
          path="/cem"
          element={
            <RequireRole role="cem">
              <CemShell />
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
          <Route path=":buildingId/ledger" element={<LedgerPage />} />
          <Route path=":buildingId/alerts" element={<AlertsPage />} />
          <Route path="note" element={<NotePage />} />
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
