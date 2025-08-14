"use client"
import { Search, Grid3X3, List, SlidersHorizontal, Download, Loader2, CheckCircle, XCircle } from "lucide-react"
import React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"

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
  onDataRefresh?: () => void // Added callback for data refresh
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
  onDataRefresh,
}: HeaderBarProps) {
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [processStatus, setProcessStatus] = React.useState<"idle" | "success" | "error">("idle")
  const { toast } = useToast()

  const handleProcessCSV = async () => {
    setIsProcessing(true)
    setProcessStatus("idle")

    try {
      const response = await fetch("/api/process-assets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      setProcessStatus("success")
      toast({
        title: "CSV Processing Complete",
        description: `Processed ${result.assetsCount || 0} assets successfully`,
      })

      // Refresh the data
      if (onDataRefresh) {
        onDataRefresh()
      }

      // Reset status after 3 seconds
      setTimeout(() => setProcessStatus("idle"), 3000)
    } catch (error) {
      console.error("Error processing CSV:", error)
      setProcessStatus("error")
      toast({
        title: "CSV Processing Failed",
        description: "Failed to process CSV data. Please try again.",
        variant: "destructive",
      })

      // Reset status after 3 seconds
      setTimeout(() => setProcessStatus("idle"), 3000)
    } finally {
      setIsProcessing(false)
    }
  }

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
            className="pl-8"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
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

      <Button
        variant="outline"
        size="sm"
        onClick={handleProcessCSV}
        disabled={isProcessing}
        className="h-8 px-3 text-xs bg-transparent"
        title="Process CSV Data"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Processing...
          </>
        ) : processStatus === "success" ? (
          <>
            <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
            Success
          </>
        ) : processStatus === "error" ? (
          <>
            <XCircle className="h-3 w-3 mr-1 text-red-600" />
            Error
          </>
        ) : (
          <>
            <Download className="h-3 w-3 mr-1" />
            Load CSV
          </>
        )}
      </Button>

      {/* View Controls */}
      <div className="flex items-center gap-1">
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
