// Script to fetch and process the real CSV data
import fs from "fs"

const CSV_URL =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/FINAL-consolidated-video-test-assets-jdHni20uYFY2xAC7Hzgw7CvJh9lSDt.csv"

async function fetchAndProcessData() {
  try {
    console.log("Fetching CSV data from:", CSV_URL)
    const response = await fetch(CSV_URL)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const csvText = await response.text()
    console.log("CSV data fetched successfully")
    console.log("First 500 characters:", csvText.substring(0, 500))

    // Parse CSV manually (simple parsing for this structure)
    const lines = csvText.split("\n")
    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))
    console.log("Headers:", headers)

    const assets = []

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      // Simple CSV parsing - handle quoted fields
      const values = []
      let current = ""
      let inQuotes = false

      for (let j = 0; j < line.length; j++) {
        const char = line[j]
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === "," && !inQuotes) {
          values.push(current.trim())
          current = ""
        } else {
          current += char
        }
      }
      values.push(current.trim())

      if (values.length >= 4) {
        const asset = {
          url: values[0] || "",
          category: values[1] || "",
          format: values[2] || "",
          notes: values[3] || "",
        }
        assets.push(asset)
      }
    }

    console.log(`Processed ${assets.length} assets`)
    console.log("Sample assets:", assets.slice(0, 3))

    // Save raw data for inspection
    fs.writeFileSync("public/raw-assets.json", JSON.stringify(assets, null, 2))
    console.log("Raw data saved to public/raw-assets.json")

    return assets
  } catch (error) {
    console.error("Error fetching/processing data:", error)
    throw error
  }
}

// Run the processing
fetchAndProcessData()
  .then((assets) => {
    console.log("Data processing completed successfully!")
    console.log(`Total assets processed: ${assets.length}`)
  })
  .catch((error) => {
    console.error("Data processing failed:", error)
  })
