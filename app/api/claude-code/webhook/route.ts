import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()

    console.log("Received Claude Code SDK results:", payload)

    // Handle different types of results
    switch (payload.type) {
      case "asset_investigation_complete":
        // Log investigation results
        console.log("Asset investigation completed:", payload.results)
        break

      case "csv_update_complete":
        // Log CSV update results
        console.log("CSV update completed:", payload.results)
        break

      case "asset_validation_complete":
        // Log validation results
        console.log("Asset validation completed:", payload.results)
        break

      default:
        console.log("Unknown Claude Code SDK result type:", payload.type)
    }

    return NextResponse.json({
      success: true,
      message: "Webhook processed successfully",
    })
  } catch (error) {
    console.error("Error processing Claude Code SDK webhook:", error)
    return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 })
  }
}
