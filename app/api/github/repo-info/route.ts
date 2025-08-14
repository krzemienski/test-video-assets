import { NextResponse } from "next/server"
import GitHubAPI from "@/lib/github"

export async function GET() {
  try {
    console.log("=== GitHub API route called ===")

    const token = process.env.GITHUB_PERSONAL_ACCESS_TOKEN
    console.log("GitHub token available:", !!token)
    console.log("Token length:", token ? token.length : 0)

    if (!token) {
      console.error("GitHub token not found in environment variables")
      return NextResponse.json({ error: "GitHub token not configured" }, { status: 500 })
    }

    console.log("Creating GitHub API instance")
    const github = new GitHubAPI(token)

    console.log("Fetching repository info for krzemienski/test-video-assets")

    // Add more detailed error handling
    const repoInfo = await github.getRepoInfo()

    console.log("Repository info fetched successfully:", {
      name: repoInfo.name,
      full_name: repoInfo.full_name,
      stars: repoInfo.stargazers_count,
      forks: repoInfo.forks_count,
      description: repoInfo.description?.substring(0, 50) + "...",
    })

    return NextResponse.json(repoInfo)
  } catch (error) {
    console.error("=== Error fetching repo info ===")
    console.error("Error type:", typeof error)
    console.error("Error message:", error instanceof Error ? error.message : String(error))
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace")

    // Check if it's a specific GitHub API error
    if (error instanceof Error) {
      if (error.message.includes("404")) {
        console.error("Repository not found - check repository name")
      } else if (error.message.includes("401") || error.message.includes("403")) {
        console.error("Authentication error - check GitHub token permissions")
      } else if (error.message.includes("rate limit")) {
        console.error("GitHub API rate limit exceeded")
      }
    }

    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    const errorDetails = {
      error: "Failed to fetch repository information",
      details: errorMessage,
      timestamp: new Date().toISOString(),
      repository: "krzemienski/test-video-assets",
    }

    return NextResponse.json(errorDetails, { status: 500 })
  }
}

// Cache the response for 5 minutes
export const revalidate = 300
