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

function isValidUrl(urlString: string): boolean {
  try {
    new URL(urlString)
    return true
  } catch {
    return false
  }
}

function validateAsset(asset: any): asset is Asset {
  return (
    asset &&
    typeof asset.id === "string" &&
    typeof asset.url === "string" &&
    isValidUrl(asset.url) &&
    Array.isArray(asset.protocols) &&
    Array.isArray(asset.codecs)
  )
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

        let assetsData: Asset[] = []
        let facetsData: FacetCounts | null = null
        let metadataData: Metadata | null = null

        try {
          const assetsResponse = await fetch("/assets.json")
          if (assetsResponse.ok) {
            const rawData = await assetsResponse.json()
            assetsData = Array.isArray(rawData) ? rawData.filter(validateAsset) : []
          }
        } catch (fetchError) {
          console.log("Assets JSON not found, using mock data")
        }

        try {
          const facetsResponse = await fetch("/facets.json")
          if (facetsResponse.ok) {
            facetsData = await facetsResponse.json()
          }
        } catch (fetchError) {
          console.log("Facets JSON not found")
        }

        try {
          const metadataResponse = await fetch("/metadata.json")
          if (metadataResponse.ok) {
            metadataData = await metadataResponse.json()
          }
        } catch (fetchError) {
          console.log("Metadata JSON not found")
        }

        if (assetsData.length === 0) {
          const mockAssets = [
            {
              id: "mock-1",
              url: "https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8",
              host: "devstreaming-cdn.apple.com",
              scheme: "https",
              category: "Apple HLS Advanced Example",
              protocols: ["hls"],
              container: "mp4",
              codecs: ["avc"],
              resolution: { width: 1920, height: 1080, label: "1080p" },
              hdr: "sdr",
              notes: "Advanced HLS example with multiple bitrates",
              features: ["multi-bitrate"],
            },
            {
              id: "mock-2",
              url: "https://bitmovin-a.akamaihd.net/content/MI201109210084_1/mpds/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.mpd",
              host: "bitmovin-a.akamaihd.net",
              scheme: "https",
              category: "Bitmovin DASH Example",
              protocols: ["dash"],
              container: "mp4",
              codecs: ["avc"],
              resolution: { width: 1920, height: 1080, label: "1080p" },
              hdr: "sdr",
              notes: "DASH streaming example",
              features: ["adaptive"],
            },
          ]

          assetsData = mockAssets.filter(validateAsset)
        }

        setAssets(assetsData)
        setFacetCounts(facetsData)
        setMetadata(metadataData)
      } catch (err) {
        console.error("Error loading assets:", err)
        const errorMessage = err instanceof Error ? err.message : "Failed to load assets"
        setError(errorMessage)

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
