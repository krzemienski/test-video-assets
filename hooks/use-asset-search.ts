"use client"

import * as React from "react"
import type { Asset } from "@/lib/types"

interface UseAssetSearchProps {
  assets: Asset[]
  searchQuery: string
}

export function useAssetSearch({ assets, searchQuery }: UseAssetSearchProps) {
  const filteredAssets = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return assets
    }

    const query = searchQuery.toLowerCase().trim()

    return assets.filter((asset) => {
      // Search in category
      if (asset.category.toLowerCase().includes(query)) return true

      // Search in protocol
      if (asset.protocol?.some((p) => p.toLowerCase().includes(query))) return true

      // Search in codec
      if (asset.codec?.some((c) => c.toLowerCase().includes(query))) return true

      // Search in host
      if (asset.host.toLowerCase().includes(query)) return true

      // Search in HDR
      if (asset.hdr?.toLowerCase().includes(query)) return true

      // Search in container
      if (asset.container?.toLowerCase().includes(query)) return true

      // Search in features
      if (asset.features?.some((f) => f.toLowerCase().includes(query))) return true

      // Search in notes
      if (asset.notes?.toLowerCase().includes(query)) return true

      // Search in resolution label
      if (asset.resolution?.label?.toLowerCase().includes(query)) return true

      return false
    })
  }, [assets, searchQuery])

  return {
    filteredAssets,
    resultCount: filteredAssets.length,
  }
}
