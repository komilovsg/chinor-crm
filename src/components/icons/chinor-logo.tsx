import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ChinorLogoProps extends React.SVGAttributes<SVGSVGElement> {
  /** Размер иконки (число — сторона в px, или строка для произвольного размера) */
  size?: number | string
}

/** Иконка-логотип CHINOR (шеф-шапка): круглый фон фирменного цвета, белая шеф-шапка. */
const ChinorLogo = React.forwardRef<HTMLSpanElement, ChinorLogoProps>(
  ({ size = 24, className, ...props }, ref) => {
    const value =
      typeof size === 'number' ? `${size}px` : (size as string)
    const sizeStyle = { width: value, height: value }
    const iconSize = typeof size === 'number' ? Math.round(size * 0.6) : size
    const iconSizeStyle =
      typeof size === 'number'
        ? { width: iconSize, height: iconSize }
        : { width: '60%', height: '60%' }
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex shrink-0 items-center justify-center rounded-full bg-primary text-white',
          className
        )}
        style={sizeStyle}
        aria-hidden
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={iconSizeStyle}
          {...props}
        >
          <path d="M17 21a1 1 0 0 0 1-1v-5.35c0-.457.316-.844.727-1.041a4 4 0 0 0-2.134-7.589 5 5 0 0 0-9.186 0 4 4 0 0 0-2.134 7.588c.411.198.727.585.727 1.041V20a1 1 0 0 0 1 1Z" />
          <path d="M6 17h12" />
        </svg>
      </span>
    )
  }
)
ChinorLogo.displayName = 'ChinorLogo'

export { ChinorLogo }
