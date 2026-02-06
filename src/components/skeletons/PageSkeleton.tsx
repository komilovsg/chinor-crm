import { Skeleton } from '@/components/ui/skeleton'

interface PageSkeletonProps {
  titleWidth?: string
  hasButton?: boolean
  hasFilters?: boolean
  tableRows?: number
}

/** Универсальный скелетон страницы: заголовок, опция кнопки/фильтров, таблица или блок. */
export function PageSkeleton({
  titleWidth = 'w-48',
  hasButton = true,
  hasFilters = false,
  tableRows = 6,
}: PageSkeletonProps) {
  return (
    <div className="p-4 sm:p-6 space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className={`h-8 ${titleWidth}`} />
          <Skeleton className="h-4 w-64" />
        </div>
        {hasButton && <Skeleton className="h-10 w-32" />}
      </div>

      {hasFilters && (
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1 max-w-sm" />
          <Skeleton className="h-10 w-36" />
        </div>
      )}

      <div className="rounded-md border border-border">
        <div className="p-4 space-y-3">
          {Array.from({ length: tableRows }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    </div>
  )
}
