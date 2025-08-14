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
    Array.isArray(asset.protocol) &&
    Array.isArray(asset.codec)
  )
}

function generateUniqueId(url: string, index?: number): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const urlHash = url
    .split("")
    .reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0)
      return a & a
    }, 0)
    .toString(36)
  return `${urlHash}-${timestamp}-${random}${index !== undefined ? `-${index}` : ""}`
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
          const assetsResponse = await fetch("/data/assets.normalized.json")
          if (assetsResponse.ok) {
            const rawData = await assetsResponse.json()
            assetsData = Array.isArray(rawData)
              ? rawData
                  .map((asset, index) => ({
                    ...asset,
                    id: asset.id || generateUniqueId(asset.url, index),
                  }))
                  .filter(validateAsset)
              : []
            console.log(`Loaded ${assetsData.length} assets from normalized data`)
          }
        } catch (fetchError) {
          console.log("Normalized assets JSON not found, trying legacy paths")
        }

        try {
          const facetsResponse = await fetch("/data/facets.normalized.json")
          if (facetsResponse.ok) {
            facetsData = await facetsResponse.json()
            console.log("Loaded facet counts from normalized data")
          }
        } catch (fetchError) {
          console.log("Normalized facets JSON not found")
        }

        if (assetsData.length === 0) {
          try {
            const assetsResponse = await fetch("/assets.json")
            if (assetsResponse.ok) {
              const rawData = await assetsResponse.json()
              assetsData = Array.isArray(rawData)
                ? rawData
                    .map((asset, index) => ({
                      ...asset,
                      id: asset.id || generateUniqueId(asset.url, index),
                    }))
                    .filter(validateAsset)
                : []
            }
          } catch (fetchError) {
            console.log("Legacy assets JSON not found, trying API route")
          }
        }

        if (!facetsData) {
          try {
            const facetsResponse = await fetch("/facets.json")
            if (facetsResponse.ok) {
              facetsData = await facetsResponse.json()
            }
          } catch (fetchError) {
            console.log("Legacy facets JSON not found")
          }
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
          try {
            console.log("Trying API route for asset processing...")
            const apiResponse = await fetch("/api/process-assets")
            if (apiResponse.ok) {
              const apiData = await apiResponse.json()
              if (apiData.assets && Array.isArray(apiData.assets)) {
                assetsData = apiData.assets
                  .map((asset, index) => ({
                    ...asset,
                    id: asset.id || generateUniqueId(asset.url, index),
                  }))
                  .filter(validateAsset)
                facetsData = apiData.facetCounts || null
                metadataData = apiData.metadata || null
                console.log(`Loaded ${assetsData.length} assets from API`)
              }
            } else {
              console.error("API response not ok:", apiResponse.status, apiResponse.statusText)
            }
          } catch (apiError) {
            console.error("API route failed:", apiError)
          }
        }

        if (assetsData.length === 0) {
          console.log("Using enhanced mock data for testing")
          const mockAssets = [
            {
              id: generateUniqueId(
                "https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8",
                0,
              ),
              url: "https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8",
              host: "devstreaming-cdn.apple.com",
              scheme: "https" as const,
              category: "Apple HLS Advanced Example",
              protocol: ["hls"] as const,
              container: "mp4" as const,
              codec: ["avc"] as const,
              resolution: { width: 1920, height: 1080, label: "1080p" },
              hdr: "sdr" as const,
              notes: "Advanced HLS example with multiple bitrates",
              features: ["multi-bitrate"],
            },
            {
              id: generateUniqueId(
                "https://bitmovin-a.akamaihd.net/content/MI201109210084_1/mpds/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.mpd",
                1,
              ),
              url: "https://bitmovin-a.akamaihd.net/content/MI201109210084_1/mpds/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.mpd",
              host: "bitmovin-a.akamaihd.net",
              scheme: "https" as const,
              category: "Bitmovin DASH Example",
              protocol: ["dash"] as const,
              container: "mp4" as const,
              codec: ["avc"] as const,
              resolution: { width: 1920, height: 1080, label: "1080p" },
              hdr: "sdr" as const,
              notes: "DASH streaming example",
              features: ["adaptive"],
            },
            {
              id: generateUniqueId(
                "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                2,
              ),
              url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
              host: "commondatastorage.googleapis.com",
              scheme: "https" as const,
              category: "Big Buck Bunny",
              protocol: ["file"] as const,
              container: "mp4" as const,
              codec: ["avc"] as const,
              resolution: { width: 1920, height: 1080, label: "1080p" },
              hdr: "sdr" as const,
              notes: "Direct MP4 file for testing",
              features: ["direct-file"],
            },
            {
              id: generateUniqueId(
                "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",
                3,
              ),
              url: "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",
              host: "demo.unified-streaming.com",
              scheme: "https" as const,
              category: "Tears of Steel",
              protocol: ["hls"] as const,
              container: "ts" as const,
              codec: ["hevc"] as const,
              resolution: { width: 3840, height: 2160, label: "4K" },
              hdr: "hdr10" as const,
              notes: "4K HDR10 HLS stream",
              features: ["4k", "hdr"],
            },
            {
              id: generateUniqueId("https://dash.akamaized.net/akamai/av1/av1.mpd", 4),
              url: "https://dash.akamaized.net/akamai/av1/av1.mpd",
              host: "dash.akamaized.net",
              scheme: "https" as const,
              category: "AV1 Test Stream",
              protocol: ["dash"] as const,
              container: "mp4" as const,
              codec: ["av1"] as const,
              resolution: { width: 1920, height: 1080, label: "1080p" },
              hdr: "sdr" as const,
              notes: "AV1 codec test stream",
              features: ["av1", "next-gen"],
            },
          ]

          assetsData = mockAssets.filter(validateAsset)

          facetsData = {
            protocol: { hls: 2, dash: 2, file: 1 },
            codec: { avc: 3, hevc: 1, av1: 1 },
            resolution: { "1080p": 4, "4K": 1 },
            hdr: { sdr: 4, hdr10: 1 },
            container: { mp4: 4, ts: 1 },
            host: {
              "devstreaming-cdn.apple.com": 1,
              "bitmovin-a.akamaihd.net": 1,
              "commondatastorage.googleapis.com": 1,
              "demo.unified-streaming.com": 1,
              "dash.akamaized.net": 1,
            },
            scheme: { https: 5 },
          }

          metadataData = {
            totalAssets: 5,
            buildTimestamp: new Date().toISOString(),
            sourceUrl: "mock-data-enhanced",
            version: "1.0.0",
          }
        }

        console.log(`Final asset count: ${assetsData.length}`)
        console.log("Sample asset:", assetsData[0])
        console.log("Facet counts:", facetsData)

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
