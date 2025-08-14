const fs = require("fs")
const path = require("path")

async function fetchNormalizedCSV() {
  try {
    console.log("Fetching normalized CSV data...")

    const response = await fetch(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/assets.normalized-EXqw5Ks31sL26nezp5ae9gS83CNLUO.csv",
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const csvData = await response.text()

    // Ensure data directory exists
    const dataDir = path.join(process.cwd(), "data")
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }

    // Write the CSV file
    const csvPath = path.join(dataDir, "video-test-assets.csv")
    fs.writeFileSync(csvPath, csvData, "utf8")

    console.log(`✅ Successfully updated ${csvPath}`)
    console.log(`📊 CSV file size: ${(csvData.length / 1024).toFixed(2)} KB`)

    // Count lines to estimate number of assets
    const lines = csvData.split("\n").filter((line) => line.trim())
    console.log(`📈 Estimated ${lines.length - 1} assets (excluding header)`)
  } catch (error) {
    console.error("❌ Error fetching normalized CSV:", error)
    process.exit(1)
  }
}

// Run the script
fetchNormalizedCSV()
