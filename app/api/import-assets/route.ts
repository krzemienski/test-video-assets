import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: NextRequest) {
  // Reuse the same logic as POST for browser access
  return POST(request)
}

export async function POST(request: NextRequest) {
  try {
    console.log("=== Manual Asset Import API ===")

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Test connection
    const { data: testData, error: testError } = await supabase
      .from("video_assets")
      .select("count", { count: "exact", head: true })

    console.log("Database connection test:", { testData, testError })

    if (testError) {
      throw new Error(`Database connection failed: ${testError.message}`)
    }

    // Fetch CSV data
    const csvUrl =
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/assets.normalized-oQtWhHTu7K9DUXbH2sSeuyoKFkypUB.csv"
    console.log("Fetching CSV from:", csvUrl)

    const response = await fetch(csvUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`)
    }

    const csvText = await response.text()
    console.log("CSV length:", csvText.length)

    // Parse CSV
    const lines = csvText.trim().split("\n")
    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))
    console.log("CSV headers:", headers)

    const assets = []
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""))
      const asset: any = {}

      headers.forEach((header, index) => {
        asset[header] = values[index] || null
      })

      // Transform to database format
      const dbAsset = {
        id: asset.id,
        url: asset.url,
        host: asset.host,
        scheme: asset.scheme,
        category: asset.category,
        protocols: asset.protocol ? [asset.protocol] : [],
        container: asset.container,
        codecs: asset.codec ? asset.codec.split("|").filter((f: string) => f.trim()) : [],
        resolution:
          asset["resolution.width"] && asset["resolution.height"]
            ? {
                width: Number.parseInt(asset["resolution.width"]) || null,
                height: Number.parseInt(asset["resolution.height"]) || null,
                label: asset["resolution.label"] || null,
              }
            : null,
        hdr: asset.hdr,
        features: asset.features ? asset.features.split("|").filter((f: string) => f.trim()) : [],
        notes: asset.notes,
      }

      assets.push(dbAsset)
    }

    console.log(`Parsed ${assets.length} assets`)
    console.log("Sample asset:", assets[0])

    // Clear existing data
    const { error: deleteError } = await supabase.from("video_assets").delete().neq("id", "impossible-id")

    if (deleteError) {
      console.warn("Delete error (might be empty table):", deleteError)
    }

    const { error: deleteFacetsError } = await supabase.from("facet_counts").delete().neq("id", -1)
    if (deleteFacetsError) {
      console.warn("Delete facets error:", deleteFacetsError)
    }

    // Insert assets in batches
    const batchSize = 100
    let totalInserted = 0

    for (let i = 0; i < assets.length; i += batchSize) {
      const batch = assets.slice(i, i + batchSize)
      const { data: insertData, error: insertError } = await supabase.from("video_assets").insert(batch).select()

      if (insertError) {
        throw new Error(`Insert batch failed: ${insertError.message}`)
      }

      totalInserted += insertData?.length || 0
      console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}: ${insertData?.length} assets`)
    }

    const facetCounts: Record<string, Record<string, number>> = {
      protocol: {},
      codec: {},
      resolution: {},
      hdr: {},
      container: {},
      host: {},
      scheme: {},
    }

    assets.forEach((asset) => {
      asset.protocols?.forEach((p: string) => {
        facetCounts.protocol[p] = (facetCounts.protocol[p] || 0) + 1
      })
      asset.codecs?.forEach((c: string) => {
        facetCounts.codec[c] = (facetCounts.codec[c] || 0) + 1
      })
      if (asset.resolution?.label) {
        facetCounts.resolution[asset.resolution.label] = (facetCounts.resolution[asset.resolution.label] || 0) + 1
      }
      if (asset.hdr) {
        facetCounts.hdr[asset.hdr] = (facetCounts.hdr[asset.hdr] || 0) + 1
      }
      if (asset.container) {
        facetCounts.container[asset.container] = (facetCounts.container[asset.container] || 0) + 1
      }
      if (asset.host) {
        facetCounts.host[asset.host] = (facetCounts.host[asset.host] || 0) + 1
      }
      if (asset.scheme) {
        facetCounts.scheme[asset.scheme] = (facetCounts.scheme[asset.scheme] || 0) + 1
      }
    })

    // Insert facet counts
    const facetRows = []
    for (const [facetType, values] of Object.entries(facetCounts)) {
      for (const [facetValue, count] of Object.entries(values)) {
        facetRows.push({
          facet_type: facetType,
          facet_value: facetValue,
          count: count,
        })
      }
    }

    if (facetRows.length > 0) {
      const { error: facetError } = await supabase.from("facet_counts").insert(facetRows)
      if (facetError) {
        console.warn("Facet insert error:", facetError)
      } else {
        console.log(`✅ Inserted ${facetRows.length} facet counts`)
      }
    }

    console.log(`✅ Successfully imported ${totalInserted} assets`)

    return NextResponse.json({
      success: true,
      imported: totalInserted,
      facets: facetRows.length,
      message: `Successfully imported ${totalInserted} assets and ${facetRows.length} facet counts`,
    })
  } catch (error) {
    console.error("❌ Import failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Import failed",
      },
      { status: 500 },
    )
  }
}
