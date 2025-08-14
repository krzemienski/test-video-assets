import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function importVideoAssets() {
  try {
    console.log("🚀 Starting video assets import from normalized CSV...")

    const csvUrl =
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/assets.normalized-oQtWhHTu7K9DUXbH2sSeuyoKFkypUB.csv"

    console.log("📥 Fetching CSV data from:", csvUrl)
    const response = await fetch(csvUrl)

    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`)
    }

    const csvText = await response.text()
    const lines = csvText.trim().split("\n")
    const headers = lines[0].split(",").map((h) => h.replace(/"/g, "").trim())

    console.log("📊 CSV Headers:", headers)
    console.log(`📊 Found ${lines.length - 1} assets to import`)

    // Clear existing data
    const { error: deleteError } = await supabase.from("video_assets").delete().neq("id", "")
    if (deleteError) {
      console.error("❌ Error clearing existing data:", deleteError)
      return
    }
    console.log("🗑️ Cleared existing video assets")

    // Clear existing facet counts
    await supabase.from("facet_counts").delete().neq("id", 0)
    console.log("🗑️ Cleared existing facet counts")

    // Parse CSV and transform data
    const assets = []
    const facetCounts = {
      protocols: {},
      codecs: {},
      containers: {},
      hosts: {},
      schemes: {},
      hdr: {},
      resolutions: {},
      features: {},
    }

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.replace(/"/g, "").trim())
      const asset = {}

      headers.forEach((header, index) => {
        asset[header] = values[index] || null
      })

      // Transform to match database schema (plural field names)
      const transformedAsset = {
        id: asset.id || `asset_${i}`,
        url: asset.url,
        host: asset.host,
        scheme: asset.scheme,
        category: asset.category?.toString() || "unknown",
        protocols: asset.protocol ? [asset.protocol] : [], // Convert singular to plural array
        container: asset.container,
        codecs: asset.codec ? [asset.codec] : [], // Convert singular to plural array
        resolution:
          asset["resolution.width"] && asset["resolution.height"]
            ? {
                width: Number.parseInt(asset["resolution.width"]) || null,
                height: Number.parseInt(asset["resolution.height"]) || null,
                label: asset["resolution.label"] || null,
              }
            : null,
        hdr: asset.hdr || "sdr",
        features: asset.features ? asset.features.split("|").filter((f) => f.trim()) : [],
        notes: asset.notes || "",
      }

      assets.push(transformedAsset)

      // Count facets for filtering
      if (transformedAsset.protocols) {
        transformedAsset.protocols.forEach((p) => {
          facetCounts.protocols[p] = (facetCounts.protocols[p] || 0) + 1
        })
      }
      if (transformedAsset.codecs) {
        transformedAsset.codecs.forEach((c) => {
          facetCounts.codecs[c] = (facetCounts.codecs[c] || 0) + 1
        })
      }
      if (transformedAsset.container) {
        facetCounts.containers[transformedAsset.container] =
          (facetCounts.containers[transformedAsset.container] || 0) + 1
      }
      if (transformedAsset.host) {
        facetCounts.hosts[transformedAsset.host] = (facetCounts.hosts[transformedAsset.host] || 0) + 1
      }
      if (transformedAsset.scheme) {
        facetCounts.schemes[transformedAsset.scheme] = (facetCounts.schemes[transformedAsset.scheme] || 0) + 1
      }
      if (transformedAsset.hdr) {
        facetCounts.hdr[transformedAsset.hdr] = (facetCounts.hdr[transformedAsset.hdr] || 0) + 1
      }
      if (transformedAsset.resolution?.label) {
        facetCounts.resolutions[transformedAsset.resolution.label] =
          (facetCounts.resolutions[transformedAsset.resolution.label] || 0) + 1
      }
      if (transformedAsset.features) {
        transformedAsset.features.forEach((f) => {
          facetCounts.features[f] = (facetCounts.features[f] || 0) + 1
        })
      }
    }

    // Insert assets in batches
    const batchSize = 100
    let imported = 0

    for (let i = 0; i < assets.length; i += batchSize) {
      const batch = assets.slice(i, i + batchSize)

      const { error: insertError } = await supabase.from("video_assets").insert(batch)

      if (insertError) {
        console.error(`❌ Error inserting batch ${i / batchSize + 1}:`, insertError)
        continue
      }

      imported += batch.length
      console.log(`✅ Imported batch ${i / batchSize + 1}: ${imported}/${assets.length} assets`)
    }

    // Insert facet counts
    console.log("📈 Importing facet counts...")
    const facetEntries = []
    for (const [facetType, counts] of Object.entries(facetCounts)) {
      for (const [value, count] of Object.entries(counts)) {
        if (count > 0) {
          facetEntries.push({
            facet_type: facetType,
            facet_value: value,
            count: count,
          })
        }
      }
    }

    if (facetEntries.length > 0) {
      const { error: facetError } = await supabase.from("facet_counts").insert(facetEntries)
      if (facetError) {
        console.error("❌ Error importing facet counts:", facetError)
      } else {
        console.log(`✅ Imported ${facetEntries.length} facet counts`)
      }
    }

    console.log(`🎉 Import completed! Successfully imported ${imported} video assets`)
  } catch (error) {
    console.error("❌ Import failed:", error)
  }
}

// Run the import
importVideoAssets()
