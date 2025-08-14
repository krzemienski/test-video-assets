"use client"

import * as React from "react"

import { AppSidebar } from "@/components/app-sidebar"
import { HeaderBar } from "@/components/header-bar"
import { AssetBrowser } from "@/components/asset-browser"
import { FilterPanel } from "@/components/filter-panel"
import { AssetDetailDrawer } from "@/components/asset-detail-drawer"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useAssets } from "@/hooks/use-assets"
import { useAssetFilters } from "@/hooks/use-asset-filters"
import type { Asset, FilterState } from "@/lib/types"

export default function HomePage() {
  // Data loading
  const { assets, facetCounts, metadata, isLoading, error } = useAssets()

  // UI state management
  const [viewMode, setViewMode] = React.useState<"table" | "cards">("table")
  const [selectedAsset, setSelectedAsset] = React.useState<Asset | undefined>()
  const [filterPanelOpen, setFilterPanelOpen] = React.useState(false)
  const [detailDrawerOpen, setDetailDrawerOpen] = React.useState(false)

  const [filters, setFilters] = React.useState<FilterState>({
    search: "",
    protocols: [],
    codecs: [],
    resolutions: [],
    hdr: [],
    containers: [],
    hosts: [],
    schemes: [],
  })

  const { filteredAssets, resultCount, activeFilterCount, activeFilterLabels } = useAssetFilters({
    assets,
    filters,
  })

  const handleClearFilters = () => {
    setFilters({
      search: "",
      protocols: [],
      codecs: [],
      resolutions: [],
      hdr: [],
      containers: [],
      hosts: [],
      schemes: [],
    })
  }

  const handleAssetSelect = (asset: Asset) => {
    setSelectedAsset(asset)
    setDetailDrawerOpen(true)
  }

  const handleSearchChange = (search: string) => {
    setFilters((prev) => ({ ...prev, search }))
  }

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (detailDrawerOpen) {
          setDetailDrawerOpen(false)
        } else if (filterPanelOpen) {
          setFilterPanelOpen(false)
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [detailDrawerOpen, filterPanelOpen])

  // Loading state
  if (isLoading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <HeaderBar
            searchQuery=""
            onSearchChange={() => {}}
            viewMode="table"
            onViewModeChange={() => {}}
            resultCount={0}
            activeFilters={[]}
            onClearFilters={() => {}}
            onFiltersClick={() => {}}
            activeFilterCount={0}
          />
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <div className="text-lg font-medium mb-2">Loading Video Test Assets...</div>
              <div className="text-sm text-muted-foreground">Processing assets from the database</div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  // Error state
  if (error) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <HeaderBar
            searchQuery=""
            onSearchChange={() => {}}
            viewMode="table"
            onViewModeChange={() => {}}
            resultCount={0}
            activeFilters={[]}
            onClearFilters={() => {}}
            onFiltersClick={() => {}}
            activeFilterCount={0}
          />
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <div className="text-lg font-medium mb-2 text-destructive">Failed to Load Assets</div>
              <div className="text-sm text-muted-foreground mb-4">{error}</div>
              <div className="text-xs text-muted-foreground">Make sure to run the data processing script first</div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <HeaderBar
          searchQuery={filters.search}
          onSearchChange={handleSearchChange}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          resultCount={resultCount}
          activeFilters={activeFilterLabels}
          onClearFilters={handleClearFilters}
          onFiltersClick={() => setFilterPanelOpen(true)}
          activeFilterCount={activeFilterCount}
        />

        <FilterPanel
          open={filterPanelOpen}
          onOpenChange={setFilterPanelOpen}
          filters={filters}
          onFiltersChange={setFilters}
          facetCounts={facetCounts}
        />

        <AssetDetailDrawer asset={selectedAsset} open={detailDrawerOpen} onOpenChange={setDetailDrawerOpen} />

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col gap-4 p-4">
          {assets.length === 0 ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center">
                <div className="text-lg font-medium mb-2">No Assets Found</div>
                <div className="text-sm text-muted-foreground">
                  Run the data processing script to populate the asset database
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Welcome section - only show when no search/filters */}
              {!filters.search && activeFilterCount === 0 && (
                <div className="rounded-lg border bg-card p-6">
                  <h2 className="text-2xl font-bold mb-4">Welcome to Video Test Assets Portal</h2>
                  <p className="text-muted-foreground mb-4">
                    A comprehensive collection of video test assets for developers, QA engineers, and video
                    professionals. Browse, search, and filter through {assets.length.toLocaleString()} carefully curated
                    video assets.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="text-center p-4 rounded-lg bg-muted/50">
                      <div className="text-2xl font-bold text-primary">
                        {facetCounts ? Object.keys(facetCounts.protocols).length : "4"}
                      </div>
                      <div className="text-sm text-muted-foreground">Streaming Protocols</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-muted/50">
                      <div className="text-2xl font-bold text-primary">
                        {facetCounts ? Object.keys(facetCounts.codecs).length : "6"}
                      </div>
                      <div className="text-sm text-muted-foreground">Video Codecs</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-muted/50">
                      <div className="text-2xl font-bold text-primary">
                        {facetCounts ? Object.keys(facetCounts.resolutions).length : "8"}
                      </div>
                      <div className="text-sm text-muted-foreground">Resolution Types</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Asset Browser */}
              <div className="flex-1">
                <AssetBrowser assets={filteredAssets} viewMode={viewMode} onAssetSelect={handleAssetSelect} />
              </div>

              {/* No results message */}
              {filteredAssets.length === 0 && (filters.search || activeFilterCount > 0) && (
                <div className="flex flex-1 items-center justify-center">
                  <div className="text-center">
                    <div className="text-lg font-medium mb-2">No Assets Found</div>
                    <div className="text-sm text-muted-foreground">
                      Try adjusting your search query or clearing filters
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
