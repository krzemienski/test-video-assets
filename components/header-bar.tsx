"use client"
import { Search, Grid3X3, List, SlidersHorizontal, Zap, Download } from "lucide-react"
import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { AdvancedSearchPanel } from "./advanced-search-panel"
import { ExportDialog } from "./export-dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { Asset } from "@/lib/types"

interface HeaderBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  viewMode: "table" | "cards"
  onViewModeChange: (mode: "table" | "cards") => void
  resultCount: number
  activeFilters: string[]
  onClearFilters: () => void
  onFiltersClick: () => void
  activeFilterCount: number
  savedSearches?: any[]
  searchHistory?: string[]
  onSaveSearch?: (name: string, query: string) => void
  onLoadSearch?: (id: string) => string
  onDeleteSearch?: (id: string) => void
  onAddToHistory?: (query: string) => void
  assets?: Asset[]
}

export function HeaderBar({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  resultCount,
  activeFilters,
  onClearFilters,
  onFiltersClick,
  activeFilterCount,
  savedSearches = [],
  searchHistory = [],
  onSaveSearch = () => {},
  onLoadSearch = () => "",
  onDeleteSearch = () => {},
  onAddToHistory = () => {},
  assets = [],
}: HeaderBarProps) {
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault()
        const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement
        searchInput?.focus()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />

      {/* Search Input */}
      <div className="flex flex-1 items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search assets... (Ctrl+K)"
            className="pl-8 pr-10"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && searchQuery.trim()) {
                onAddToHistory(searchQuery)
              }
            }}
          />
          {/* Advanced Search Button */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="absolute right-1 top-1 h-6 w-6 p-0" title="Advanced Search">
                <Zap className="h-3 w-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96" align="start">
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
            </PopoverContent>
          </Popover>
        </div>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="flex items-center gap-1">
            {activeFilters.slice(0, 3).map((filter, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {filter}
              </Badge>
            ))}
            {activeFilters.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{activeFilters.length - 3} more
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={onClearFilters} className="h-6 px-2 text-xs">
              Clear
            </Button>
          </div>
        )}
      </div>

      {/* Result Count */}
      <div className="text-sm text-muted-foreground">{resultCount.toLocaleString()} assets</div>

      {/* View Controls */}
      <div className="flex items-center gap-1">
        <ExportDialog assets={assets} filteredCount={resultCount}>
          <Button variant="ghost" size="sm" className="h-8 px-2" title="Export">
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </ExportDialog>

        <Separator orientation="vertical" className="h-4" />

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
        <Separator orientation="vertical" className="h-4" />
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
    </header>
  )
}
