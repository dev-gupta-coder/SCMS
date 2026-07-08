import { create } from 'zustand'
import { cn } from '@/lib/cn'

type ToastVariant = 'success' | 'error' | 'info'

interface ToastItem {
  id: number
  message: string
  variant: ToastVariant
}

interface ToastStore {
  toasts: ToastItem[]
  push: (message: string, variant: ToastVariant) => void
  dismiss: (id: number) => void
}

let nextId = 0
const DEFAULT_DURATION_MS = 3000

const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  push: (message, variant) => {
    const id = nextId++
    set((state) => ({ toasts: [...state.toasts, { id, message, variant }] }))
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
    }, DEFAULT_DURATION_MS)
  },
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}))

/** Imperative toast API — call from anywhere, e.g. `toast.error('Only 4 left')`. */
export const toast = {
  success: (message: string) => useToastStore.getState().push(message, 'success'),
  error: (message: string) => useToastStore.getState().push(message, 'error'),
  info: (message: string) => useToastStore.getState().push(message, 'info'),
}

const variantClasses: Record<ToastVariant, string> = {
  success: 'bg-green-600',
  error: 'bg-red-600',
  info: 'bg-gray-900',
}

/** Mount once near the root of the app so `toast.*()` calls have somewhere to render. */
export function Toaster() {
  const toasts = useToastStore((state) => state.toasts)
  const dismiss = useToastStore((state) => state.dismiss)

  if (toasts.length === 0) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => dismiss(t.id)}
          className={cn(
            'pointer-events-auto max-w-sm rounded-xl px-4 py-3 text-center text-sm font-medium text-white shadow-lg',
            variantClasses[t.variant],
          )}
        >
          {t.message}
        </button>
      ))}
    </div>
  )
}
