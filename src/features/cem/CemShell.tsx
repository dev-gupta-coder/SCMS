import { Outlet } from 'react-router-dom'
import { ThemeToggle } from '@/components/ui'

/** Minimal persistent top bar shared by every CEM screen — mobile-first, so it stays out of the way of the one-decision-per-screen flows below it. Renders child routes via <Outlet />. */
export function CemShell() {
  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-2">
          <img src="/logo.png" alt="Canvas Workspace" className="h-6" />
          <ThemeToggle />
        </div>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  )
}
