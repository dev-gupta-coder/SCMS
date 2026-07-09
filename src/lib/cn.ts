// Job of this file: Build CSS class names safely.
// ex ->> className={cn(
//           "btn",
//           isActive && "bg-purple",
//           isDisabled && "opacity-50"
//         )}
 
// then this file convert this classname into "btn bg-purple opacity-50" (if active and disabled are true) or "btn bg-purple" (if active is true and disabled is false) or "btn opacity-50" (if active is false and disabled is true) or "btn" (if both are false)
type ClassValue = string | number | null | undefined | false | ClassValue[]

function flatten(input: ClassValue, out: string[]) {
  if (!input) return
  if (Array.isArray(input)) {
    for (const item of input) flatten(item, out)
    return
  }
  out.push(String(input))
}

/** Joins conditional class names, dropping falsy values. Not a Tailwind-conflict merger. */
export function cn(...inputs: ClassValue[]): string {
  const out: string[] = []
  flatten(inputs, out)
  return out.join(' ')
}
