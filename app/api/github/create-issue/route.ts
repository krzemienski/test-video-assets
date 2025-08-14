import { type NextRequest, NextResponse } from "next/server"
import GitHubAPI, { createAssetIssue, type AssetIssueData } from "@/lib/github"

export async function POST(request: NextRequest) {
  try {
    const issueData: AssetIssueData = await request.json()

    if (!process.env.GITHUB_PERSONAL_ACCESS_TOKEN) {
      return NextResponse.json({ error: "GitHub token not configured" }, { status: 500 })
    }

    const github = new GitHubAPI(process.env.GITHUB_PERSONAL_ACCESS_TOKEN)

    // Create the GitHub issue
    const issue = createAssetIssue(issueData)
    const createdIssue = await github.createIssue(issue)

    // Trigger Claude Code SDK investigation
    try {
      await github.triggerClaudeCodeSDK(issueData)
    } catch (error) {
      console.warn("Failed to trigger Claude Code SDK:", error)
      // Don't fail the entire request if SDK trigger fails
    }

    return NextResponse.json({
      success: true,
      issue: {
        number: createdIssue.number,
        url: createdIssue.html_url,
        title: createdIssue.title,
      },
    })
  } catch (error) {
    console.error("Error creating GitHub issue:", error)
    return NextResponse.json({ error: "Failed to create GitHub issue" }, { status: 500 })
  }
}
