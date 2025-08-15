"use client"

import * as React from "react"
import type { Asset, FacetCounts, Metadata } from "@/lib/types"

interface UseAssetsReturn {
  assets: Asset[]
  facetCounts: FacetCounts | null
  metadata: Metadata | null
  isLoading: boolean
  error: string | null
}

export function useAssets(): UseAssetsReturn {
  const [assets, setAssets] = React.useState<Asset[]>([])
  const [facetCounts, setFacetCounts] = React.useState<FacetCounts | null>(null)
  const [metadata, setMetadata] = React.useState<Metadata | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    async function loadAssets() {
      try {
        setIsLoading(true)
        setError(null)

        console.log("🚀 Loading assets from API...")

        const response = await fetch("/api/process-assets")
        
        if (!response.ok) {
          throw new Error(`Failed to fetch assets: ${response.statusText}`)
        }

        const data = await response.json()
        
        console.log(`✅ Successfully loaded ${data.assets?.length || 0} assets from API`)
        console.log("📊 Sample asset:", data.assets?.[0])
        console.log("🏷️ Facet counts:", data.facetCounts)

        setAssets(data.assets || [])
        setFacetCounts(data.facetCounts || null)
        setMetadata(data.metadata || null)
      } catch (err) {
        console.error("❌ Error loading assets from API:", err)
        setError(err instanceof Error ? err.message : "Failed to load assets")
        setAssets([])
        setFacetCounts(null)
        setMetadata(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadAssets()
  }, [])

  return {
    assets,
    facetCounts,
    metadata,
    isLoading,
    error,
  }
}