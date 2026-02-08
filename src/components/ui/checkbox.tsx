import * as React from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'checked' | 'onChange'> {
  checked?: boolean | 'indeterminate'
  onCheckedChange?: (checked: boolean) => void
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, id, ...props }, ref) => {
    const inputId = React.useId()
    const checkboxId = id ?? inputId
    const inputRef = React.useRef<HTMLInputElement>(null)

    const setRefs = React.useCallback(
      (node: HTMLInputElement | null) => {
        (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = node
        if (typeof ref === 'function') ref(node)
        else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node
      },
      [ref]
    )

    React.useEffect(() => {
      const el = inputRef.current
      if (el) {
        el.indeterminate = checked === 'indeterminate'
      }
    }, [checked])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onCheckedChange?.(e.target.checked)
    }

    const isChecked = checked === true
    const isIndeterminate = checked === 'indeterminate'

    return (
      <label
        htmlFor={checkboxId}
        className={cn(
          'flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded border border-input bg-background transition-colors',
          'hover:bg-accent/50',
          'focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
          isChecked && 'border-primary bg-primary text-primary-foreground',
          isIndeterminate && 'border-primary bg-primary text-primary-foreground',
          !isChecked && !isIndeterminate && 'hover:border-primary/50',
          props.disabled && 'cursor-not-allowed opacity-50',
          className
        )}
      >
        <input
          ref={setRefs}
          id={checkboxId}
          type="checkbox"
          checked={isChecked}
          onChange={handleChange}
          className="sr-only"
          aria-checked={isIndeterminate ? 'mixed' : isChecked}
          {...props}
        />
        {isChecked && <Check className="h-3 w-3 stroke-[2.5]" />}
        {isIndeterminate && !isChecked && (
          <span className="h-0.5 w-3 rounded-full bg-primary-foreground" />
        )}
      </label>
    )
  }
)
Checkbox.displayName = 'Checkbox'

export { Checkbox }
