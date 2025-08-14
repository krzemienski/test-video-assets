import { type NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function POST(request: NextRequest) {
  try {
    const updates = await request.json()
    const csvPath = path.join(process.cwd(), "data", "video-test-assets.csv")

    // Read current CSV
    let csvContent = ""
    try {
      csvContent = fs.readFileSync(csvPath, "utf-8")
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: "CSV file not found",
        },
        { status: 404 },
      )
    }

    const lines = csvContent.split("\n").filter((line) => line.trim())
    const headers = lines[0]
    let dataLines = lines.slice(1)

    // Process removals
    if (updates.remove && updates.remove.length > 0) {
      dataLines = dataLines.filter((line) => {
        const url = line.split(",")[0].replace(/"/g, "").trim()
        return !updates.remove.includes(url)
      })
    }

    // Process additions
    if (updates.add && updates.add.length > 0) {
      for (const asset of updates.add) {
        const csvLine = `"${asset.url}","${asset.category}","${asset.formatProtocol || ""}","${asset.notes || ""}"`
        dataLines.push(csvLine)
      }
    }

    // Process edits
    if (updates.edit && updates.edit.length > 0) {
      dataLines = dataLines.map((line) => {
        const url = line.split(",")[0].replace(/"/g, "").trim()
        const edit = updates.edit.find((e) => e.url === url)

        if (edit) {
          return `"${edit.changes.url || url}","${edit.changes.category || ""}","${edit.changes.formatProtocol || ""}","${edit.changes.notes || ""}"`
        }

        return line
      })
    }

    // Rebuild CSV content
    const newCsvContent = [headers, ...dataLines].join("\n")

    // Write updated CSV
    fs.writeFileSync(csvPath, newCsvContent, "utf-8")

    try {
      const siteUrl = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : request.headers.get("host")
          ? `https://${request.headers.get("host")}`
          : "http://localhost:3000"

      // Trigger reprocessing via API call instead of exec
      fetch(`${siteUrl}/api/process-assets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }).catch((error) => {
        console.warn("Could not trigger data reprocessing:", error)
      })
    } catch (error) {
      console.warn("Could not trigger data reprocessing:", error)
    }

    return NextResponse.json({
      success: true,
      message: `CSV updated successfully. ${updates.add?.length || 0} added, ${updates.remove?.length || 0} removed, ${updates.edit?.length || 0} edited.`,
    })
  } catch (error) {
    console.error("Error updating CSV:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update CSV file",
      },
      { status: 500 },
    )
  }
}
