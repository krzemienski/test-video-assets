"use client"

import { useState, useEffect } from "react"
import { ExternalLink, Star, GitFork, Eye, Calendar } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

interface GitHubRepo {
  name: string
  full_name: string
  description: string
  html_url: string
  stargazers_count: number
  forks_count: number
  watchers_count: number
  language: string
  updated_at: string
  topics: string[]
}

export function GitHubRepoInfo() {
  const [repo, setRepo] = useState<GitHubRepo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRepoInfo = async () => {
      try {
        console.log("=== GitHubRepoInfo: Fetching repository info ===")

        const response = await fetch("/api/github/repo-info")
        console.log("API response status:", response.status)
        console.log("API response ok:", response.ok)

        if (!response.ok) {
          const errorText = await response.text()
          console.error("API response error:", errorText)
          throw new Error(`HTTP ${response.status}: ${errorText}`)
        }

        const data = await response.json()
        console.log("API response data:", {
          name: data.name,
          stars: data.stargazers_count,
          forks: data.forks_count,
          hasError: !!data.error,
        })

        if (data.error) {
          throw new Error(data.details || data.error)
        }

        setRepo(data)
        console.log("Repository info set successfully")
      } catch (err) {
        console.error("=== GitHubRepoInfo: Error ===")
        console.error("Error type:", typeof err)
        console.error("Error message:", err instanceof Error ? err.message : String(err))
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
        console.log("=== GitHubRepoInfo: Loading complete ===")
      }
    }

    fetchRepoInfo()
  }, [])

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-3 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-12" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !repo) {
    return (
      <Card className="w-full">
        <CardContent className="p-3">
          <div className="text-sm text-muted-foreground">Repository: Error loading</div>
          <div className="text-xs text-muted-foreground">{error ? `Error: ${error}` : "Assets: Unknown"}</div>
          <div className="text-xs text-red-500 mt-1">Debug: Check browser console for details</div>
        </CardContent>
      </Card>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "k"
    }
    return num.toString()
  }

  return (
    <Card className="w-full">
      <CardContent className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium truncate">{repo.name}</h4>
            <p className="text-xs text-muted-foreground line-clamp-2">{repo.description}</p>
          </div>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 ml-2" asChild>
            <a href={repo.html_url} target="_blank" rel="noopener noreferrer" aria-label="Open repository">
              <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3" />
            <span>{formatNumber(repo.stargazers_count)}</span>
          </div>
          <div className="flex items-center gap-1">
            <GitFork className="h-3 w-3" />
            <span>{formatNumber(repo.forks_count)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            <span>{formatNumber(repo.watchers_count)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span>{repo.language}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(repo.updated_at)}</span>
          </div>
        </div>

        {repo.topics && repo.topics.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {repo.topics.slice(0, 3).map((topic) => (
              <span key={topic} className="px-1.5 py-0.5 text-xs bg-secondary text-secondary-foreground rounded">
                {topic}
              </span>
            ))}
            {repo.topics.length > 3 && (
              <span className="px-1.5 py-0.5 text-xs bg-secondary text-secondary-foreground rounded">
                +{repo.topics.length - 3}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
