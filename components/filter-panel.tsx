"use client"

import * as React from "react"
import { X } from "lucide-react"

import type { FilterState, FacetCounts, Protocol, Codec, Hdr, Container, Scheme } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"

interface FilterPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  facetCounts?: FacetCounts | null
}

interface FilterSectionProps {
  title: string
  items: Array<{ value: string; label: string; count?: number }>
  selectedValues: string[]
  onSelectionChange: (values: string[]) => void
}

function FilterSection({ title, items, selectedValues, onSelectionChange }: FilterSectionProps) {
  const handleToggle = (value: string) => {
    const newSelection = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value]
    onSelectionChange(newSelection)
  }

  const handleSelectAll = () => {
    onSelectionChange(items.map((item) => item.value))
  }

  const handleClearAll = () => {
    onSelectionChange([])
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">{title}</h4>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={handleSelectAll}>
            All
          </Button>
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={handleClearAll}>
            None
          </Button>
        </div>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.value} className="flex items-center space-x-2">
            <Checkbox
              id={`${title}-${item.value}`}
              checked={selectedValues.includes(item.value)}
              onCheckedChange={() => handleToggle(item.value)}
            />
            <label
              htmlFor={`${title}-${item.value}`}
              className="flex-1 text-sm font-normal cursor-pointer flex items-center justify-between"
            >
              <span>{item.label}</span>
              {item.count !== undefined && (
                <Badge variant="secondary" className="text-xs">
                  {item.count.toLocaleString()}
                </Badge>
              )}
            </label>
          </div>
        ))}
      </div>
    </div>
  )
}

export function FilterPanel({ open, onOpenChange, filters, onFiltersChange, facetCounts }: FilterPanelProps) {
  const protocolItems = React.useMemo(() => {
    const protocols: Protocol[] = ["hls", "dash", "cmaf", "smooth", "file", "other"]
    return protocols.map((protocol) => ({
      value: protocol,
      label: protocol.toUpperCase(),
      count: facetCounts?.protocol?.[protocol] || 0,
    }))
  }, [facetCounts])

  const codecItems = React.useMemo(() => {
    const codecs: Codec[] = ["avc", "hevc", "av1", "vp9", "mpeg2", "vvc", "other"]
    return codecs.map((codec) => ({
      value: codec,
      label: codec === "avc" ? "H.264/AVC" : codec === "hevc" ? "HEVC/H.265" : codec.toUpperCase(),
      count: facetCounts?.codec?.[codec] || 0,
    }))
  }, [facetCounts])

  const hdrItems = React.useMemo(() => {
    const hdrTypes: Hdr[] = ["hdr10", "hlg", "dovi", "hdr", "sdr"]
    return hdrTypes.map((hdr) => ({
      value: hdr,
      label: hdr === "dovi" ? "Dolby Vision" : hdr.toUpperCase(),
      count: facetCounts?.hdr?.[hdr] || 0,
    }))
  }, [facetCounts])

  const containerItems = React.useMemo(() => {
    const containers: Container[] = ["mp4", "ts", "mkv", "webm", "mov", "yuv", "other"]
    return containers.map((container) => ({
      value: container,
      label: container.toUpperCase(),
      count: facetCounts?.container?.[container] || 0,
    }))
  }, [facetCounts])

  const resolutionItems = React.useMemo(() => {
    if (!facetCounts?.resolution) return []
    return Object.entries(facetCounts.resolution)
      .sort(([a], [b]) => {
        // Sort by resolution height
        const getHeight = (res: string) => {
          if (res === "8K") return 4320
          if (res === "4K") return 2160
          const match = res.match(/(\d+)p/)
          return match ? Number.parseInt(match[1]) : 0
        }
        return getHeight(b) - getHeight(a)
      })
      .map(([resolution, count]) => ({
        value: resolution,
        label: resolution,
        count,
      }))
  }, [facetCounts])

  const hostItems = React.useMemo(() => {
    if (!facetCounts?.host) return []
    return Object.entries(facetCounts.host)
      .sort(([, a], [, b]) => b - a) // Sort by count descending
      .slice(0, 20) // Top 20 hosts
      .map(([host, count]) => ({
        value: host,
        label: host,
        count,
      }))
  }, [facetCounts])

  const schemeItems = React.useMemo(() => {
    if (!facetCounts?.scheme) return []
    return Object.entries(facetCounts.scheme).map(([scheme, count]) => ({
      value: scheme,
      label: scheme.toUpperCase(),
      count,
    }))
  }, [facetCounts])

  const activeFilterCount = React.useMemo(() => {
    return (
      filters.protocol.length +
      filters.codec.length +
      filters.resolution.length +
      filters.hdr.length +
      filters.container.length +
      filters.host.length +
      filters.scheme.length
    )
  }, [filters])

  const handleClearAll = () => {
    onFiltersChange({
      search: filters.search,
      protocol: [],
      codec: [],
      resolution: [],
      hdr: [],
      container: [],
      host: [],
      scheme: [],
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{activeFilterCount} active</Badge>
                <Button variant="ghost" size="sm" onClick={handleClearAll} className="h-6 px-2">
                  <X className="h-3 w-3" />
                  Clear All
                </Button>
              </div>
            )}
          </SheetTitle>
          <SheetDescription>Filter video assets by technical specifications and properties</SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)] mt-6">
          <div className="space-y-6 pr-6">
            {/* Protocols */}
            <FilterSection
              title="Streaming Protocols"
              items={protocolItems}
              selectedValues={filters.protocol}
              onSelectionChange={(protocol) => onFiltersChange({ ...filters, protocol: protocol as Protocol[] })}
            />

            <Separator />

            {/* Codecs */}
            <FilterSection
              title="Video Codecs"
              items={codecItems}
              selectedValues={filters.codec}
              onSelectionChange={(codec) => onFiltersChange({ ...filters, codec: codec as Codec[] })}
            />

            <Separator />

            {/* Resolutions */}
            {resolutionItems.length > 0 && (
              <>
                <FilterSection
                  title="Resolution"
                  items={resolutionItems}
                  selectedValues={filters.resolution}
                  onSelectionChange={(resolution) => onFiltersChange({ ...filters, resolution })}
                />
                <Separator />
              </>
            )}

            {/* HDR */}
            <FilterSection
              title="HDR Support"
              items={hdrItems}
              selectedValues={filters.hdr}
              onSelectionChange={(hdr) => onFiltersChange({ ...filters, hdr: hdr as Hdr[] })}
            />

            <Separator />

            {/* Containers */}
            <FilterSection
              title="Container Format"
              items={containerItems}
              selectedValues={filters.container}
              onSelectionChange={(container) => onFiltersChange({ ...filters, container: container as Container[] })}
            />

            <Separator />

            {/* Schemes */}
            {schemeItems.length > 0 && (
              <>
                <FilterSection
                  title="URL Scheme"
                  items={schemeItems}
                  selectedValues={filters.scheme}
                  onSelectionChange={(scheme) => onFiltersChange({ ...filters, scheme: scheme as Scheme[] })}
                />
                <Separator />
              </>
            )}

            {/* Top Hosts */}
            {hostItems.length > 0 && (
              <FilterSection
                title="Top Hosts"
                items={hostItems}
                selectedValues={filters.host}
                onSelectionChange={(host) => onFiltersChange({ ...filters, host })}
              />
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
