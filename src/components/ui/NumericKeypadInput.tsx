import { useId } from 'react'
import { cn } from '@/lib/cn'

export interface NumericKeypadInputProps {
  /** Raw numeric string being entered, e.g. "12.5". Empty string means "no value yet". */
  value: string
  onChange: (value: string) => void
  label?: string
  /** Shown after the value in the readout, e.g. "Kg" or "per unit". */
  unit?: string
  placeholder?: string
  /** Validation message shown under the readout (e.g. hard-block "Only 4 left"). */
  error?: string
  allowDecimal?: boolean
  maxDecimals?: number
  className?: string
}

/** Strips a raw text-input edit down to a valid numeric string: digits, at most one ".", capped decimal places. */
function sanitizeNumericInput(raw: string, allowDecimal: boolean, maxDecimals: number): string {
  let cleaned = raw.replace(/[^\d.]/g, '')
  if (!allowDecimal) cleaned = cleaned.replace(/\./g, '')

  const firstDot = cleaned.indexOf('.')
  if (firstDot !== -1) {
    cleaned = cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, '')
  }

  if (cleaned.includes('.')) {
    const [whole, decimals] = cleaned.split('.')
    cleaned = maxDecimals > 0 ? `${whole}.${decimals.slice(0, maxDecimals)}` : whole
  }

  return cleaned
}

/**
 * CLAUDE.md UX Polish: swapped from an on-screen button grid to a native
 * <input inputMode="decimal"> so mobile shows the OS numeric keyboard —
 * the external props/contract (raw numeric string in `value`, same
 * `onChange`) are unchanged so every existing call site keeps working.
 */
export function NumericKeypadInput({
  value,
  onChange,
  label,
  unit,
  placeholder = '0',
  error,
  allowDecimal = true,
  maxDecimals = 2,
  className,
}: NumericKeypadInputProps) {
  const inputId = useId()

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {label}
        </label>
      )}

      <div
        className={cn(
          'flex min-h-16 items-baseline gap-2 rounded-xl border bg-gray-50 px-4 dark:bg-gray-800',
          error ? 'border-red-400 dark:border-red-500' : 'border-gray-200 dark:border-gray-700',
        )}
      >
        <input
          id={inputId}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(sanitizeNumericInput(event.target.value, allowDecimal, maxDecimals))}
          className={cn(
            'min-w-0 flex-1 bg-transparent text-3xl font-semibold tabular-nums text-gray-900 outline-none dark:text-gray-100',
            'placeholder:text-gray-300 dark:placeholder:text-gray-600',
          )}
        />
        {unit && <span className="text-base text-gray-500 dark:text-gray-400">{unit}</span>}
      </div>

      {error && <span className="text-sm font-medium text-red-600 dark:text-red-400">{error}</span>}

      {value !== '' && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="self-center text-sm font-medium text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
        >
          Clear
        </button>
      )}
    </div>
  )
}
