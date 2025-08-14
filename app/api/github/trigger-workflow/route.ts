import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { workflow, inputs } = await request.json()

    const response = await fetch(
      `https://api.github.com/repos/krzemienski/test-video-assets/actions/workflows/${workflow}/dispatches`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ref: "main",
          inputs: inputs,
        }),
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`GitHub API error: ${response.status} ${errorText}`)
    }

    return NextResponse.json({
      success: true,
      message: "Workflow triggered successfully",
    })
  } catch (error) {
    console.error("Error triggering GitHub workflow:", error)
    return NextResponse.json({ error: "Failed to trigger workflow" }, { status: 500 })
  }
}
