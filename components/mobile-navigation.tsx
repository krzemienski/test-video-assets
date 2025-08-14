"use client"
import { Menu, SlidersHorizontal, Grid3X3, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { AppSidebar } from "./app-sidebar"
import { useTouchGestures } from "@/hooks/use-touch-gestures"

interface MobileNavigationProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  activeFilterCount: number
  onFiltersClick: () => void
  viewMode: "table" | "cards"
  onViewModeChange: (mode: "table" | "cards") => void
}

export function MobileNavigation({
  isOpen,
  onOpenChange,
  activeFilterCount,
  onFiltersClick,
  viewMode,
  onViewModeChange,
}: MobileNavigationProps) {
  const gestureHandlers = useTouchGestures({
    onSwipeRight: () => onOpenChange(true),
    onSwipeLeft: () => onOpenChange(false),
    threshold: 100,
  })

  return (
    <>
      {/* Mobile Header */}
      <div className="flex md:hidden h-14 items-center justify-between px-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0" {...gestureHandlers}>
            <SheetHeader className="p-4 border-b">
              <SheetTitle className="text-left">Navigation</SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-auto">
              <AppSidebar
                collapsible="none"
                onFilterChange={(filters) => {
                  // Handle filter changes and close mobile nav
                  if (window.innerWidth < 768) {
                    onOpenChange(false)
                  }
                  // You might need to pass this up to the parent component
                  console.log("Mobile sidebar filter change:", filters)
                }}
              />
            </div>
          </SheetContent>
        </Sheet>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 relative" onClick={onFiltersClick} title="Filters">
            <SlidersHorizontal className="h-4 w-4" />
            {activeFilterCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs flex items-center justify-center"
              >
                {activeFilterCount > 9 ? "9+" : activeFilterCount}
              </Badge>
            )}
          </Button>

          <Button
            variant={viewMode === "table" ? "default" : "ghost"}
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => onViewModeChange("table")}
            title="Table View"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "cards" ? "default" : "ghost"}
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => onViewModeChange("cards")}
            title="Card View"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Swipe indicator */}
      {!isOpen && (
        <div
          className="fixed left-0 top-1/2 -translate-y-1/2 w-1 h-16 bg-primary/20 rounded-r-full md:hidden z-40 transition-opacity opacity-0 hover:opacity-100"
          {...gestureHandlers}
        />
      )}
    </>
  )
}
