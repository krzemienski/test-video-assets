"use client"

import * as React from "react"
import { Search, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { AdvancedSearchPanel } from "./advanced-search-panel"

interface MobileSearchProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  savedSearches?: any[]
  searchHistory?: string[]
  onSaveSearch?: (name: string, query: string) => void
  onLoadSearch?: (id: string) => string
  onDeleteSearch?: (id: string) => void
  onAddToHistory?: (query: string) => void
}

export function MobileSearch({
  searchQuery,
  onSearchChange,
  savedSearches = [],
  searchHistory = [],
  onSaveSearch = () => {},
  onLoadSearch = () => "",
  onDeleteSearch = () => {},
  onAddToHistory = () => {},
}: MobileSearchProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [showAdvanced, setShowAdvanced] = React.useState(false)

  return (
    <>
      {/* Mobile Search Bar */}
      <div className="flex md:hidden px-4 py-2 border-b bg-background/95 backdrop-blur">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search assets..."
            className="pl-8 pr-10"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && searchQuery.trim()) {
                onAddToHistory(searchQuery)
                setIsOpen(false)
              }
            }}
          />
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1 h-6 w-6 p-0"
            onClick={() => setShowAdvanced(true)}
            title="Advanced Search"
          >
            <Zap className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Advanced Search Sheet */}
      <Sheet open={showAdvanced} onOpenChange={setShowAdvanced}>
        <SheetContent side="bottom" className="h-[80vh]">
          <SheetHeader>
            <SheetTitle>Advanced Search</SheetTitle>
          </SheetHeader>
          <div className="mt-4 overflow-auto">
            <AdvancedSearchPanel
              searchQuery={searchQuery}
              onSearchChange={onSearchChange}
              savedSearches={savedSearches}
              searchHistory={searchHistory}
              onSaveSearch={onSaveSearch}
              onLoadSearch={onLoadSearch}
              onDeleteSearch={onDeleteSearch}
              onAddToHistory={onAddToHistory}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
