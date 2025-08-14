"use client"

import * as React from "react"
import type { Asset, FacetCounts, Metadata } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"

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

        console.log("🚀 Loading assets from Supabase...")

        const supabase = createClient()

        // Load assets from Supabase
        let assetsData
        const { data: initialAssetsData, error: assetsError } = await supabase
          .from("video_assets")
          .select("*")
          .order("created_at", { ascending: false })

        if (assetsError) {
          throw new Error(`Failed to load assets: ${assetsError.message}`)
        }

        console.log(`📊 Loaded ${initialAssetsData?.length || 0} assets from Supabase`)

        if (!initialAssetsData || initialAssetsData.length === 0) {
          console.log("🔄 Database is empty, auto-importing assets from CSV...")

          try {
            console.log("🧹 Clearing existing data...")
            await supabase.from("facet_counts").delete().neq("id", 0)
            await supabase.from("video_assets").delete().neq("id", "")

            // Fetch CSV data
            const csvResponse = await fetch(
              "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/assets.normalized-oQtWhHTu7K9DUXbH2sSeuyoKFkypUB.csv",
            )
            if (!csvResponse.ok) {
              throw new Error(`Failed to fetch CSV: ${csvResponse.statusText}`)
            }

            const csvText = await csvResponse.text()
            const lines = csvText.split("\n").filter((line) => line.trim())
            const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))

            console.log("📋 CSV headers:", headers)
            console.log(`📊 Processing ${lines.length - 1} assets from CSV...`)

            const csvAssets = []
            const facetCountsMap = {
              protocol: new Map(),
              codec: new Map(),
              resolution: new Map(),
              hdr: new Map(),
              container: new Map(),
              host: new Map(),
              scheme: new Map(),
            }

            for (let i = 1; i < lines.length; i++) {
              const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""))
              const row: any = {}

              headers.forEach((header, index) => {
                row[header] = values[index] || ""
              })

              // Transform CSV row to database format
              const asset = {
                id: row.id,
                url: row.url,
                host: row.host || "",
                scheme: row.scheme || "https",
                category: row.category || "",
                protocols: row.protocol ? [row.protocol] : [], // Convert singular to plural array
                container: row.container || null,
                codecs: row.codec ? [row.codec] : [], // Convert singular to plural array
                resolution:
                  row["resolution.width"] && row["resolution.height"]
                    ? {
                        width: Number.parseInt(row["resolution.width"]) || 0,
                        height: Number.parseInt(row["resolution.height"]) || 0,
                        label: row["resolution.label"] || "",
                      }
                    : null,
                hdr: row.hdr || "sdr",
                notes: row.notes || "",
                features: row.features ? [row.features] : [],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              }

              csvAssets.push(asset)

              // Count facets
              if (asset.protocols)
                asset.protocols.forEach((p) =>
                  facetCountsMap.protocol.set(p, (facetCountsMap.protocol.get(p) || 0) + 1),
                )
              if (asset.codecs)
                asset.codecs.forEach((c) => facetCountsMap.codec.set(c, (facetCountsMap.codec.get(c) || 0) + 1))
              if (asset.resolution?.label)
                facetCountsMap.resolution.set(
                  asset.resolution.label,
                  (facetCountsMap.resolution.get(asset.resolution.label) || 0) + 1,
                )
              if (asset.hdr) facetCountsMap.hdr.set(asset.hdr, (facetCountsMap.hdr.get(asset.hdr) || 0) + 1)
              if (asset.container)
                facetCountsMap.container.set(asset.container, (facetCountsMap.container.get(asset.container) || 0) + 1)
              if (asset.host) facetCountsMap.host.set(asset.host, (facetCountsMap.host.get(asset.host) || 0) + 1)
              if (asset.scheme)
                facetCountsMap.scheme.set(asset.scheme, (facetCountsMap.scheme.get(asset.scheme) || 0) + 1)
            }

            const batchSize = 100
            for (let i = 0; i < csvAssets.length; i += batchSize) {
              const batch = csvAssets.slice(i, i + batchSize)
              const { error: insertError } = await supabase.from("video_assets").insert(batch)

              if (insertError) {
                console.error(`❌ Error inserting batch ${i / batchSize + 1}:`, insertError)
                throw new Error(`Failed to insert batch ${i / batchSize + 1}: ${insertError.message}`)
              } else {
                console.log(`✅ Inserted batch ${i / batchSize + 1} (${batch.length} assets)`)
              }
            }

            // Insert facet counts
            const facetRows = []
            for (const [facetType, counts] of Object.entries(facetCountsMap)) {
              for (const [value, count] of counts.entries()) {
                facetRows.push({
                  facet_type: facetType,
                  facet_value: value,
                  count: count,
                  updated_at: new Date().toISOString(),
                })
              }
            }

            if (facetRows.length > 0) {
              const { error: facetError } = await supabase.from("facet_counts").insert(facetRows)

              if (facetError) {
                console.error("❌ Error inserting facet counts:", facetError)
                throw new Error(`Failed to insert facet counts: ${facetError.message}`)
              } else {
                console.log(`✅ Inserted ${facetRows.length} facet count entries`)
              }
            }

            console.log("🎉 Auto-import completed successfully!")

            // Reload data after import
            const { data: newAssetsData } = await supabase
              .from("video_assets")
              .select("*")
              .order("created_at", { ascending: false })

            assetsData = newAssetsData
          } catch (importError) {
            console.error("❌ Auto-import failed:", importError)
            throw new Error(
              `Auto-import failed: ${importError instanceof Error ? importError.message : "Unknown error"}`,
            )
          }
        } else {
          assetsData = initialAssetsData
        }

        // Load facet counts from Supabase
        const { data: facetsData, error: facetsError } = await supabase.from("facet_counts").select("*")

        if (facetsError) {
          console.warn("Failed to load facet counts:", facetsError.message)
        }

        const transformedAssets: Asset[] = (assetsData || []).map((dbAsset) => ({
          id: dbAsset.id,
          url: dbAsset.url,
          host: dbAsset.host || "",
          scheme: dbAsset.scheme || "https",
          category: dbAsset.category || "",
          protocol: dbAsset.protocols || [], // Convert plural to singular
          container: dbAsset.container || null,
          codec: dbAsset.codecs || [], // Convert plural to singular
          resolution: dbAsset.resolution || null,
          hdr: dbAsset.hdr || "sdr",
          notes: dbAsset.notes || "",
          features: dbAsset.features || [],
        }))

        const transformedFacetCounts: FacetCounts = {
          protocol: {},
          codec: {},
          resolution: {},
          hdr: {},
          container: {},
          host: {},
          scheme: {},
        }

        if (facetsData) {
          facetsData.forEach((facet) => {
            const facetType = facet.facet_type as keyof FacetCounts
            if (transformedFacetCounts[facetType]) {
              transformedFacetCounts[facetType][facet.facet_value] = facet.count
            }
          })
        }

        const finalMetadata: Metadata = {
          totalAssets: transformedAssets.length,
          buildTimestamp: new Date().toISOString(),
          sourceUrl: "supabase://video_assets",
          version: "1.0.0",
        }

        console.log(`✅ Successfully loaded ${transformedAssets.length} assets from Supabase`)
        console.log("📊 Sample asset:", transformedAssets[0])
        console.log("🏷️ Facet counts:", transformedFacetCounts)

        setAssets(transformedAssets)
        setFacetCounts(transformedFacetCounts)
        setMetadata(finalMetadata)
      } catch (err) {
        console.error("❌ Error loading assets from Supabase:", err)
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
