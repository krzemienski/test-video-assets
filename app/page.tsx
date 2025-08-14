"use client"

import * as React from "react"

import { AppSidebar } from "@/components/app-sidebar"
import { HeaderBar } from "@/components/header-bar"
import { AssetBrowser } from "@/components/asset-browser"
import { FilterPanel } from "@/components/filter-panel"
import { AssetDetailDrawer } from "@/components/asset-detail-drawer"
import { LoadingSkeleton } from "@/components/loading-skeleton"
import { TutorialOverlay } from "@/components/tutorial-overlay"
import { ContextualTooltip } from "@/components/contextual-tooltip"
import { AnimatedButton } from "@/components/micro-interactions"
import { MobileNavigation } from "@/components/mobile-navigation"
import { MobileSearch } from "@/components/mobile-search"
import { MobileAssetCard } from "@/components/mobile-asset-card"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { useAssets } from "@/hooks/use-assets"
import { useAssetFilters } from "@/hooks/use-asset-filters"
import { useAdvancedSearch } from "@/hooks/use-advanced-search"
import { useQualityScoring } from "@/hooks/use-quality-scoring"
import { useTouchGestures } from "@/hooks/use-touch-gestures"
import type { Asset, FilterState } from "@/lib/types"

export default function HomePage() {
  const [refreshKey, setRefreshKey] = React.useState(0)

  // Data loading
  const { assets, facetCounts, metadata, isLoading, error } = useAssets()

  // Quality scoring
  const { scoreAssets, getRecommendations } = useQualityScoring()

  // UI state management
  const [viewMode, setViewMode] = React.useState<"table" | "cards">("cards") // Default to cards on mobile
  const [selectedAsset, setSelectedAsset] = React.useState<Asset | undefined>()
  const [filterPanelOpen, setFilterPanelOpen] = React.useState(false)
  const [detailDrawerOpen, setDetailDrawerOpen] = React.useState(false)
  const [showTutorial, setShowTutorial] = React.useState(false)
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false)

  const [filters, setFilters] = React.useState<FilterState>({
    search: "",
    protocol: [],
    codec: [],
    resolution: [],
    hdr: [],
    container: [],
    host: [],
    scheme: [],
  })

  const { filteredAssets, resultCount, activeFilterCount, activeFilterLabels } = useAssetFilters({
    assets,
    filters,
  })

  // Advanced search functionality
  const { savedSearches, searchHistory, addToHistory, saveSearch, loadSavedSearch, deleteSavedSearch } =
    useAdvancedSearch({
      assets: filteredAssets,
      searchQuery: filters.search,
    })

  // Score assets with quality metrics
  const scoredAssets = React.useMemo(() => {
    return scoreAssets(filteredAssets)
  }, [filteredAssets, scoreAssets])

  const globalGestureHandlers = useTouchGestures({
    onSwipeRight: () => {
      if (!mobileNavOpen && window.innerWidth < 768) {
        setMobileNavOpen(true)
      }
    },
    onSwipeLeft: () => {
      if (mobileNavOpen && window.innerWidth < 768) {
        setMobileNavOpen(false)
      }
    },
    threshold: 100,
  })

  // Check if this is the user's first visit
  React.useEffect(() => {
    const hasSeenTutorial = localStorage.getItem("video-assets-tutorial-seen")
    if (!hasSeenTutorial && assets.length > 0) {
      setShowTutorial(true)
    }
  }, [assets.length])

  const handleTutorialComplete = () => {
    localStorage.setItem("video-assets-tutorial-seen", "true")
    setShowTutorial(false)
  }

  const handleDataRefresh = React.useCallback(() => {
    setRefreshKey((prev) => prev + 1)
    window.location.reload()
  }, [])

  const handleClearFilters = () => {
    setFilters({
      search: "",
      protocol: [],
      codec: [],
      resolution: [],
      hdr: [],
      container: [],
      host: [],
      scheme: [],
    })
  }

  const handleSidebarFilterChange = (sidebarFilters: Record<string, string[]>) => {
    if (!sidebarFilters) return

    console.log("Sidebar filter change:", sidebarFilters)

    setFilters((prev) => {
      const newFilters = {
        ...prev,
        ...sidebarFilters,
      }
      console.log("Updated filters:", newFilters)
      return newFilters
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
        } else if (mobileNavOpen) {
          setMobileNavOpen(false)
        }
      }
      if ((event.ctrlKey || event.metaKey) && event.key === "?") {
        event.preventDefault()
        setShowTutorial(true)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [detailDrawerOpen, filterPanelOpen, mobileNavOpen])

  // Loading state with skeleton
  if (isLoading) {
    return (
      <SidebarProvider>
        <div className="flex h-screen">
          <div className="hidden md:block w-64 border-r">
            <LoadingSkeleton variant="sidebar" />
          </div>
          <div className="flex-1 flex flex-col">
            <LoadingSkeleton variant="header" />
            <div className="flex-1 p-4">
              <LoadingSkeleton variant="cards" count={6} />
            </div>
          </div>
        </div>
      </SidebarProvider>
    )
  }

  // Error state
  if (error) {
    return (
      <SidebarProvider>
        <div className="flex h-screen" {...globalGestureHandlers}>
          <div className="hidden md:block">
            <AppSidebar onFilterChange={handleSidebarFilterChange} />
          </div>
          <div className="flex-1 flex flex-col">
            <MobileNavigation
              isOpen={mobileNavOpen}
              onOpenChange={setMobileNavOpen}
              activeFilterCount={activeFilterCount}
              onFiltersClick={() => setFilterPanelOpen(true)}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onFilterChange={handleSidebarFilterChange}
            />
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
              assets={[]}
            />
            <div className="flex flex-1 items-center justify-center p-4">
              <div className="text-center">
                <div className="text-lg font-medium mb-2 text-destructive">Failed to Load Assets</div>
                <div className="text-sm text-muted-foreground mb-4">{error}</div>
                <AnimatedButton animation="pulse" onClick={handleDataRefresh}>
                  Retry Loading
                </AnimatedButton>
              </div>
            </div>
          </div>
        </div>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen" {...(globalGestureHandlers || {})}>
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <AppSidebar onFilterChange={handleSidebarFilterChange} />
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile Navigation */}
          <MobileNavigation
            isOpen={mobileNavOpen}
            onOpenChange={setMobileNavOpen}
            activeFilterCount={activeFilterCount}
            onFiltersClick={() => setFilterPanelOpen(true)}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onFilterChange={handleSidebarFilterChange}
          />

          {/* Mobile Search */}
          <MobileSearch
            searchQuery={filters.search}
            onSearchChange={handleSearchChange}
            savedSearches={savedSearches}
            searchHistory={searchHistory}
            onSaveSearch={saveSearch}
            onLoadSearch={loadSavedSearch}
            onDeleteSearch={deleteSavedSearch}
            onAddToHistory={addToHistory}
          />

          {/* Desktop Header */}
          <div className="hidden md:block">
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
              assets={scoredAssets}
              savedSearches={savedSearches}
              searchHistory={searchHistory}
              onSaveSearch={saveSearch}
              onLoadSearch={loadSavedSearch}
              onDeleteSearch={deleteSavedSearch}
              onAddToHistory={addToHistory}
            />
          </div>

          <FilterPanel
            open={filterPanelOpen}
            onOpenChange={setFilterPanelOpen}
            filters={filters}
            onFiltersChange={setFilters}
            facetCounts={facetCounts}
          />

          <AssetDetailDrawer asset={selectedAsset} open={detailDrawerOpen} onOpenChange={setDetailDrawerOpen} />

          {/* Tutorial Overlay */}
          <TutorialOverlay
            isOpen={showTutorial}
            onClose={() => setShowTutorial(false)}
            onComplete={handleTutorialComplete}
          />

          {/* Main Content Area */}
          <div className="flex flex-1 flex-col gap-4 p-4 overflow-auto">
            {assets.length === 0 ? (
              <div className="flex flex-1 items-center justify-center">
                <div className="text-center">
                  <div className="text-lg font-medium mb-2">No Assets Found</div>
                  <div className="text-sm text-muted-foreground">
                    The asset database appears to be empty. Try running the data processing script.
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Welcome section - only show when no search/filters */}
                {!filters.search && activeFilterCount === 0 && (
                  <div className="rounded-lg border bg-card p-4 md:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl md:text-2xl font-bold">Welcome to Video Test Assets Portal</h2>
                      <ContextualTooltip
                        content="Take a guided tour to learn about all the features"
                        aiExplanation="The tutorial will walk you through search, filtering, quality scoring, and export features to help you get the most out of the portal."
                      >
                        <Button variant="outline" size="sm" onClick={() => setShowTutorial(true)}>
                          Take Tour
                        </Button>
                      </ContextualTooltip>
                    </div>
                    <p className="text-muted-foreground mb-4 text-sm md:text-base">
                      A comprehensive collection of video test assets for developers, QA engineers, and video
                      professionals. Browse, search, and filter through {assets.length.toLocaleString()} carefully
                      curated video assets.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                      <ContextualTooltip
                        content="Different streaming protocols supported"
                        aiExplanation="HLS, DASH, CMAF, and other protocols each have different strengths for various use cases and device compatibility."
                      >
                        <div className="text-center p-4 rounded-lg bg-muted/50 cursor-help">
                          <div className="text-2xl font-bold text-primary">
                            {facetCounts?.protocol ? Object.keys(facetCounts.protocol).length : "4"}
                          </div>
                          <div className="text-sm text-muted-foreground">Streaming Protocols</div>
                        </div>
                      </ContextualTooltip>
                      <ContextualTooltip
                        content="Video compression formats available"
                        aiExplanation="Modern codecs like AV1 and HEVC offer better compression than older formats like H.264, but have different compatibility requirements."
                      >
                        <div className="text-center p-4 rounded-lg bg-muted/50 cursor-help">
                          <div className="text-2xl font-bold text-primary">
                            {facetCounts?.codec ? Object.keys(facetCounts.codec).length : "6"}
                          </div>
                          <div className="text-sm text-muted-foreground">Video Codecs</div>
                        </div>
                      </ContextualTooltip>
                      <ContextualTooltip
                        content="Different video resolutions from SD to 8K"
                        aiExplanation="Higher resolutions provide better quality but require more bandwidth and processing power. Choose based on your target devices and network conditions."
                      >
                        <div className="text-center p-4 rounded-lg bg-muted/50 cursor-help">
                          <div className="text-2xl font-bold text-primary">
                            {facetCounts?.resolution ? Object.keys(facetCounts.resolution).length : "8"}
                          </div>
                          <div className="text-sm text-muted-foreground">Resolution Types</div>
                        </div>
                      </ContextualTooltip>
                    </div>
                  </div>
                )}

                {/* Asset Browser */}
                <div className="flex-1">
                  <div className="block md:hidden">
                    <div className="grid grid-cols-1 gap-4">
                      {scoredAssets.map((asset) => (
                        <MobileAssetCard
                          key={asset.id}
                          asset={asset}
                          onSelect={handleAssetSelect}
                          onPreview={handleAssetSelect}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="hidden md:block">
                    <AssetBrowser assets={scoredAssets} viewMode={viewMode} onAssetSelect={handleAssetSelect} />
                  </div>
                </div>

                {/* No results message */}
                {filteredAssets.length === 0 && (filters.search || activeFilterCount > 0) && (
                  <div className="flex flex-1 items-center justify-center">
                    <div className="text-center">
                      <div className="text-lg font-medium mb-2">No Assets Found</div>
                      <div className="text-sm text-muted-foreground mb-4">
                        Try adjusting your search query or clearing filters
                      </div>
                      <AnimatedButton animation="scale" onClick={handleClearFilters}>
                        Clear All Filters
                      </AnimatedButton>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </SidebarProvider>
  )
}
