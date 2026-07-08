import { useEffect } from 'react'
import { createPortal } from 'react-dom'

export interface ConfirmationScreenProps {
  open: boolean
  message: string
  subMessage?: string
  /** Called when the user taps continue, or automatically after `autoCloseMs`. */
  onDone: () => void
  /** If set, the screen dismisses itself after this many ms instead of waiting for a tap. */
  autoCloseMs?: number
}

/**
 * Full-screen success confirmation (PRD 10.5) — used after a delivery, transfer,
 * or consumption is logged so a CEM gets unambiguous feedback before moving on.
 */
export function ConfirmationScreen({ open, message, subMessage, onDone, autoCloseMs }: ConfirmationScreenProps) {
  useEffect(() => {
    if (!open || !autoCloseMs) return
    const timer = setTimeout(onDone, autoCloseMs)
    return () => clearTimeout(timer)
  }, [open, autoCloseMs, onDone])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-white px-6 text-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
        <svg viewBox="0 0 24 24" fill="none" className="h-12 w-12 text-green-600">
          <path
            d="M5 13l4 4L19 7"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-xl font-semibold text-gray-900">{message}</p>
        {subMessage && <p className="text-base text-gray-500">{subMessage}</p>}
      </div>

      {!autoCloseMs && (
        <button
          type="button"
          onClick={onDone}
          className="min-h-14 rounded-xl bg-canvas-500 px-8 text-lg font-semibold text-white hover:bg-canvas-600"
        >
          Continue
        </button>
      )}
    </div>,
    document.body,
  )
}
