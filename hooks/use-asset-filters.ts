"use client"

import * as React from "react"
import type { Asset, FilterState } from "@/lib/types"

interface UseAssetFiltersProps {
  assets: Asset[]
  filters: FilterState
}

export function useAssetFilters({ assets, filters }: UseAssetFiltersProps) {
  const filteredAssets = React.useMemo(() => {
    if (!assets) return []

    return assets.filter((asset) => {
      // Search filter
      if (filters.search.trim()) {
        const query = filters.search.toLowerCase().trim()
        const searchableText = [
          asset.category,
          asset.host,
          asset.hdr || "",
          asset.container || "",
          asset.notes || "",
          asset.resolution?.label || "",
          ...asset.protocol,
          ...(asset.codec || []),
          ...asset.features,
        ]
          .join(" ")
          .toLowerCase()

        if (!searchableText.includes(query)) {
          return false
        }
      }

      // Protocol filter (OR within facet)
      if (filters.protocol.length > 0) {
        const hasMatchingProtocol = asset.protocol.some((protocol) => filters.protocol.includes(protocol))
        if (!hasMatchingProtocol) return false
      }

      // Codec filter (OR within facet)
      if (filters.codec.length > 0) {
        const hasMatchingCodec = asset.codec?.some((codec) => filters.codec.includes(codec))
        if (!hasMatchingCodec) return false
      }

      // Resolution filter (OR within facet)
      if (filters.resolution.length > 0) {
        const hasMatchingResolution = asset.resolution?.label && filters.resolution.includes(asset.resolution.label)
        if (!hasMatchingResolution) return false
      }

      // HDR filter (OR within facet)
      if (filters.hdr.length > 0) {
        const hasMatchingHdr = asset.hdr && filters.hdr.includes(asset.hdr)
        if (!hasMatchingHdr) return false
      }

      // Container filter (OR within facet)
      if (filters.container.length > 0) {
        const hasMatchingContainer = asset.container && filters.container.includes(asset.container)
        if (!hasMatchingContainer) return false
      }

      // Host filter (OR within facet)
      if (filters.host.length > 0) {
        const hasMatchingHost = filters.host.includes(asset.host)
        if (!hasMatchingHost) return false
      }

      // Scheme filter (OR within facet)
      if (filters.scheme.length > 0) {
        const hasMatchingScheme = filters.scheme.includes(asset.scheme)
        if (!hasMatchingScheme) return false
      }

      return true
    })
  }, [assets, filters])

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

  const activeFilterLabels = React.useMemo(() => {
    const labels: string[] = []

    filters.protocol.forEach((protocol) => labels.push(protocol.toUpperCase()))
    filters.codec.forEach((codec) => {
      const label = codec === "avc" ? "H.264" : codec === "hevc" ? "HEVC" : codec.toUpperCase()
      labels.push(label)
    })
    filters.resolution.forEach((resolution) => labels.push(resolution))
    filters.hdr.forEach((hdr) => {
      const label = hdr === "dovi" ? "Dolby Vision" : hdr.toUpperCase()
      labels.push(label)
    })
    filters.container.forEach((container) => labels.push(container.toUpperCase()))
    filters.scheme.forEach((scheme) => labels.push(scheme.toUpperCase()))
    filters.host.forEach((host) => labels.push(host))

    return labels
  }, [filters])

  return {
    filteredAssets,
    resultCount: filteredAssets.length,
    activeFilterCount,
    activeFilterLabels,
  }
}
