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

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'backspace'] as const

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
  const handleKeyPress = (key: (typeof KEYS)[number]) => {
    if (key === 'backspace') {
      onChange(value.slice(0, -1))
      return
    }

    if (key === '.') {
      if (!allowDecimal || value.includes('.')) return
      onChange(value === '' ? '0.' : `${value}.`)
      return
    }

    if (value.includes('.')) {
      const decimals = value.split('.')[1] ?? ''
      if (decimals.length >= maxDecimals) return
    }

    // Avoid a leading extra zero, e.g. "0" + "5" -> "5", not "05".
    if (value === '0') {
      onChange(key)
      return
    }

    onChange(value + key)
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {label && <span className="text-sm font-medium text-gray-600">{label}</span>}

      <div
        className={cn(
          'flex min-h-16 items-baseline gap-2 rounded-xl border bg-gray-50 px-4',
          error ? 'border-red-400' : 'border-gray-200',
        )}
      >
        <span className={cn('text-3xl font-semibold tabular-nums', value ? 'text-gray-900' : 'text-gray-300')}>
          {value || placeholder}
        </span>
        {unit && <span className="text-base text-gray-500">{unit}</span>}
      </div>

      {error && <span className="text-sm font-medium text-red-600">{error}</span>}

      <div className="grid grid-cols-3 gap-2">
        {KEYS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => handleKeyPress(key)}
            disabled={key === '.' && !allowDecimal}
            aria-label={key === 'backspace' ? 'Delete last digit' : key === '.' ? 'Decimal point' : key}
            className={cn(
              'min-h-14 rounded-xl bg-gray-100 text-2xl font-semibold text-gray-900',
              'hover:bg-gray-200 active:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-30',
            )}
          >
            {key === 'backspace' ? (
              <svg viewBox="0 0 24 24" fill="none" className="mx-auto h-6 w-6">
                <path
                  d="M9 6h11a1 1 0 011 1v10a1 1 0 01-1 1H9l-6-6 6-6z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
                <path d="M13 10l4 4m0-4l-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            ) : (
              key
            )}
          </button>
        ))}
      </div>

      {value !== '' && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="self-center text-sm font-medium text-gray-400 hover:text-gray-600"
        >
          Clear
        </button>
      )}
    </div>
  )
}
