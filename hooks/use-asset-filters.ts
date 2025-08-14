"use client"

import * as React from "react"
import type { Asset, FilterState } from "@/lib/types"

interface UseAssetFiltersProps {
  assets: Asset[]
  filters: FilterState
}

export function useAssetFilters({ assets, filters }: UseAssetFiltersProps) {
  const filteredAssets = React.useMemo(() => {
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
          ...asset.protocols,
          ...(asset.codecs || []),
          ...asset.features,
        ]
          .join(" ")
          .toLowerCase()

        if (!searchableText.includes(query)) {
          return false
        }
      }

      // Protocol filter (OR within facet)
      if (filters.protocols.length > 0) {
        const hasMatchingProtocol = asset.protocols.some((protocol) => filters.protocols.includes(protocol))
        if (!hasMatchingProtocol) return false
      }

      // Codec filter (OR within facet)
      if (filters.codecs.length > 0) {
        const hasMatchingCodec = asset.codecs?.some((codec) => filters.codecs.includes(codec))
        if (!hasMatchingCodec) return false
      }

      // Resolution filter (OR within facet)
      if (filters.resolutions.length > 0) {
        const hasMatchingResolution = asset.resolution?.label && filters.resolutions.includes(asset.resolution.label)
        if (!hasMatchingResolution) return false
      }

      // HDR filter (OR within facet)
      if (filters.hdr.length > 0) {
        const hasMatchingHdr = asset.hdr && filters.hdr.includes(asset.hdr)
        if (!hasMatchingHdr) return false
      }

      // Container filter (OR within facet)
      if (filters.containers.length > 0) {
        const hasMatchingContainer = asset.container && filters.containers.includes(asset.container)
        if (!hasMatchingContainer) return false
      }

      // Host filter (OR within facet)
      if (filters.hosts.length > 0) {
        const hasMatchingHost = filters.hosts.includes(asset.host)
        if (!hasMatchingHost) return false
      }

      // Scheme filter (OR within facet)
      if (filters.schemes.length > 0) {
        const hasMatchingScheme = filters.schemes.includes(asset.scheme)
        if (!hasMatchingScheme) return false
      }

      return true
    })
  }, [assets, filters])

  const activeFilterCount = React.useMemo(() => {
    return (
      filters.protocols.length +
      filters.codecs.length +
      filters.resolutions.length +
      filters.hdr.length +
      filters.containers.length +
      filters.hosts.length +
      filters.schemes.length
    )
  }, [filters])

  const activeFilterLabels = React.useMemo(() => {
    const labels: string[] = []

    filters.protocols.forEach((protocol) => labels.push(protocol.toUpperCase()))
    filters.codecs.forEach((codec) => {
      const label = codec === "avc" ? "H.264" : codec === "hevc" ? "HEVC" : codec.toUpperCase()
      labels.push(label)
    })
    filters.resolutions.forEach((resolution) => labels.push(resolution))
    filters.hdr.forEach((hdr) => {
      const label = hdr === "dovi" ? "Dolby Vision" : hdr.toUpperCase()
      labels.push(label)
    })
    filters.containers.forEach((container) => labels.push(container.toUpperCase()))
    filters.schemes.forEach((scheme) => labels.push(scheme.toUpperCase()))
    filters.hosts.forEach((host) => labels.push(host))

    return labels
  }, [filters])

  return {
    filteredAssets,
    resultCount: filteredAssets.length,
    activeFilterCount,
    activeFilterLabels,
  }
}
