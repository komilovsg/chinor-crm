import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { AppSidebar } from './AppSidebar'

interface MobileSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** Мобильное меню: Sheet с навигацией (тот же список, что в сайдбаре). */
export function MobileSheet({ open, onOpenChange }: MobileSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-56 p-0">
        <SheetHeader className="sr-only">
          <SheetTitle>Меню</SheetTitle>
        </SheetHeader>
        <AppSidebar
          className="h-full border-0"
          onNavClick={() => onOpenChange(false)}
        />
      </SheetContent>
    </Sheet>
  )
}
