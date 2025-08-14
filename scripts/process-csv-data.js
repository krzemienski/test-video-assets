import fs from "fs"
import path from "path"
import { createHash } from "crypto"

// Fetch and process the CSV data
async function processVideoAssets() {
  const csvUrl =
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/FINAL-consolidated-video-test-assets-jdHni20uYFY2xAC7Hzgw7CvJh9lSDt.csv"

  console.log("Fetching CSV data...")
  const response = await fetch(csvUrl)
  const csvText = await response.text()

  // Parse CSV (simple implementation)
  const lines = csvText.split("\n").filter((line) => line.trim())
  const headers = lines[0].split(",").map((h) => h.replace(/"/g, "").trim())

  console.log("Headers found:", headers)
  console.log(`Processing ${lines.length - 1} rows...`)

  const assets = []
  const facetCounts = {
    protocols: {},
    codecs: {},
    resolutions: {},
    hdr: {},
    containers: {},
    hosts: {},
    schemes: {},
  }

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    if (values.length < 4) continue

    const [url, category, formatProtocol, notes] = values
    if (!url || url.trim() === "") continue

    // Normalize URL
    let normalizedUrl = url.trim()
    if (!normalizedUrl.match(/^https?:\/\//)) {
      normalizedUrl = "https://" + normalizedUrl
    }

    // Extract host and scheme
    let host = "unknown"
    let scheme = "https"
    try {
      const urlObj = new URL(normalizedUrl)
      host = urlObj.hostname
      scheme = urlObj.protocol.replace(":", "")
    } catch (e) {
      console.warn(`Invalid URL: ${normalizedUrl}`)
      host = "unknown"
      scheme = "unknown"
    }

    // Generate stable ID
    const id = createHash("md5").update(normalizedUrl).digest("hex").substring(0, 8)

    // Extract protocols
    const protocols = extractProtocols(formatProtocol, notes)

    // Extract codecs
    const codecs = extractCodecs(formatProtocol, notes)

    // Extract resolution
    const resolution = extractResolution(formatProtocol, notes)

    // Extract HDR info
    const hdr = extractHDR(formatProtocol, notes)

    // Extract container
    const container = extractContainer(normalizedUrl, formatProtocol, notes)

    // Extract features
    const features = extractFeatures(formatProtocol, notes)

    const asset = {
      id,
      url: normalizedUrl,
      host,
      scheme,
      category: category?.trim() || "Uncategorized",
      protocols,
      codecs,
      resolution,
      hdr,
      container,
      notes: notes?.trim() || "",
      features,
    }

    assets.push(asset)

    // Update facet counts
    protocols.forEach((p) => (facetCounts.protocols[p] = (facetCounts.protocols[p] || 0) + 1))
    codecs.forEach((c) => (facetCounts.codecs[c] = (facetCounts.codecs[c] || 0) + 1))
    if (resolution?.label)
      facetCounts.resolutions[resolution.label] = (facetCounts.resolutions[resolution.label] || 0) + 1
    if (hdr) facetCounts.hdr[hdr] = (facetCounts.hdr[hdr] || 0) + 1
    if (container) facetCounts.containers[container] = (facetCounts.containers[container] || 0) + 1
    facetCounts.hosts[host] = (facetCounts.hosts[host] || 0) + 1
    facetCounts.schemes[scheme] = (facetCounts.schemes[scheme] || 0) + 1
  }

  // Sort facet counts
  Object.keys(facetCounts).forEach((key) => {
    const sorted = Object.entries(facetCounts[key])
      .sort(([, a], [, b]) => b - a)
      .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {})
    facetCounts[key] = sorted
  })

  const metadata = {
    totalAssets: assets.length,
    buildTimestamp: new Date().toISOString(),
    sourceUrl: csvUrl,
    version: "1.0.0",
  }

  // Ensure public directory exists
  const publicDir = path.join(process.cwd(), "public")
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true })
  }

  // Write output files
  fs.writeFileSync(path.join(publicDir, "assets.json"), JSON.stringify(assets, null, 2))

  fs.writeFileSync(path.join(publicDir, "facets.json"), JSON.stringify(facetCounts, null, 2))

  fs.writeFileSync(path.join(publicDir, "metadata.json"), JSON.stringify(metadata, null, 2))

  console.log(`✅ Processed ${assets.length} assets`)
  console.log(`📊 Generated facet counts for ${Object.keys(facetCounts).length} categories`)
  console.log("📁 Files written to public/ directory")

  return { assets, facetCounts, metadata }
}

// Helper functions
function parseCSVLine(line) {
  const result = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === "," && !inQuotes) {
      result.push(current.trim())
      current = ""
    } else {
      current += char
    }
  }

  result.push(current.trim())
  return result
}

function extractProtocols(formatProtocol, notes) {
  const text = `${formatProtocol} ${notes}`.toLowerCase()
  const protocols = []

  if (text.includes("hls")) protocols.push("hls")
  if (text.includes("dash")) protocols.push("dash")
  if (text.includes("cmaf")) protocols.push("cmaf")
  if (text.includes("smooth") || text.includes("mss")) protocols.push("smooth")

  return protocols.length > 0 ? protocols : ["file"]
}

function extractCodecs(formatProtocol, notes) {
  const text = `${formatProtocol} ${notes}`.toLowerCase()
  const codecs = []

  if (text.includes("h.264") || text.includes("avc")) codecs.push("avc")
  if (text.includes("h.265") || text.includes("hevc")) codecs.push("hevc")
  if (text.includes("av1")) codecs.push("av1")
  if (text.includes("vp9")) codecs.push("vp9")
  if (text.includes("mpeg-2") || text.includes("mpeg2")) codecs.push("mpeg2")
  if (text.includes("vvc") || text.includes("h.266")) codecs.push("vvc")

  return codecs
}

function extractResolution(formatProtocol, notes) {
  const text = `${formatProtocol} ${notes}`

  // Look for specific resolution patterns
  const resolutionPatterns = [
    { pattern: /\b4320p\b/i, width: 7680, height: 4320, label: "8K" },
    { pattern: /\b2160p\b|4K|UHD/i, width: 3840, height: 2160, label: "4K" },
    { pattern: /\b1440p\b/i, width: 2560, height: 1440, label: "1440p" },
    { pattern: /\b1080p\b|FHD/i, width: 1920, height: 1080, label: "1080p" },
    { pattern: /\b720p\b|HD/i, width: 1280, height: 720, label: "720p" },
    { pattern: /\b480p\b/i, width: 854, height: 480, label: "480p" },
    { pattern: /\b360p\b/i, width: 640, height: 360, label: "360p" },
    { pattern: /\b240p\b/i, width: 426, height: 240, label: "240p" },
  ]

  for (const { pattern, width, height, label } of resolutionPatterns) {
    if (pattern.test(text)) {
      return { width, height, label }
    }
  }

  // Look for WxH patterns
  const dimensionMatch = text.match(/\b(\d{3,4})[×x](\d{3,4})\b/)
  if (dimensionMatch) {
    const width = Number.parseInt(dimensionMatch[1])
    const height = Number.parseInt(dimensionMatch[2])
    let label = `${width}x${height}`

    // Convert to standard labels
    if (height >= 2160) label = "4K"
    else if (height >= 1440) label = "1440p"
    else if (height >= 1080) label = "1080p"
    else if (height >= 720) label = "720p"
    else if (height >= 480) label = "480p"
    else if (height >= 360) label = "360p"
    else if (height >= 240) label = "240p"

    return { width, height, label }
  }

  return null
}

function extractHDR(formatProtocol, notes) {
  const text = `${formatProtocol} ${notes}`.toLowerCase()

  if (text.includes("dolby vision") || text.includes("dovi")) return "dovi"
  if (text.includes("hdr10")) return "hdr10"
  if (text.includes("hlg")) return "hlg"
  if (text.includes("hdr")) return "hdr"

  return "sdr"
}

function extractContainer(url, formatProtocol, notes) {
  const text = `${url} ${formatProtocol} ${notes}`.toLowerCase()

  if (text.includes(".mp4") || text.includes("mp4")) return "mp4"
  if (text.includes(".ts") || text.includes("mpeg-ts")) return "ts"
  if (text.includes(".mkv")) return "mkv"
  if (text.includes(".webm")) return "webm"
  if (text.includes(".mov")) return "mov"
  if (text.includes(".yuv") || text.includes("raw")) return "yuv"

  return null
}

function extractFeatures(formatProtocol, notes) {
  const text = `${formatProtocol} ${notes}`.toLowerCase()
  const features = []

  if (text.includes("8k")) features.push("8K")
  if (text.includes("stereo") || text.includes("3d")) features.push("Stereo")
  if (text.includes("multi") && text.includes("audio")) features.push("Multi-Audio")
  if (text.includes("subtitle") || text.includes("caption")) features.push("Subtitles")
  if (text.includes("drm") || text.includes("encrypted")) features.push("DRM")
  if (text.includes("live")) features.push("Live")
  if (text.includes("vr") || text.includes("360")) features.push("VR/360")

  return features
}

// Run the script
processVideoAssets().catch(console.error)
