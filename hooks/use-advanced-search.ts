"use client"

import * as React from "react"
import type { Asset } from "@/lib/types"

interface SearchOperator {
  type: "AND" | "OR" | "NOT" | "FIELD" | "EXACT" | "TERM"
  field?: string
  value: string
  negate?: boolean
}

interface SavedSearch {
  id: string
  name: string
  query: string
  createdAt: Date
  lastUsed: Date
}

interface UseAdvancedSearchProps {
  assets: Asset[]
  searchQuery: string
}

export function useAdvancedSearch({ assets, searchQuery }: UseAdvancedSearchProps) {
  const [savedSearches, setSavedSearches] = React.useState<SavedSearch[]>([])
  const [searchHistory, setSearchHistory] = React.useState<string[]>([])

  // Load saved searches from localStorage
  React.useEffect(() => {
    const saved = localStorage.getItem("video-assets-saved-searches")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setSavedSearches(
          parsed.map((s: any) => ({
            ...s,
            createdAt: new Date(s.createdAt),
            lastUsed: new Date(s.lastUsed),
          })),
        )
      } catch (error) {
        console.error("Failed to load saved searches:", error)
      }
    }

    const history = localStorage.getItem("video-assets-search-history")
    if (history) {
      try {
        setSearchHistory(JSON.parse(history))
      } catch (error) {
        console.error("Failed to load search history:", error)
      }
    }
  }, [])

  // Parse search query into operators
  const parseSearchQuery = React.useCallback((query: string): SearchOperator[] => {
    if (!query.trim()) return []

    const operators: SearchOperator[] = []
    const tokens = query.match(/(?:[^\s"]+|"[^"]*")+/g) || []

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i].trim()

      // Handle NOT operator
      if (token.toUpperCase() === "NOT" && i + 1 < tokens.length) {
        const nextToken = tokens[i + 1]
        if (nextToken.includes(":")) {
          const [field, value] = nextToken.split(":", 2)
          operators.push({
            type: "FIELD",
            field: field.toLowerCase(),
            value: value.replace(/"/g, ""),
            negate: true,
          })
        } else {
          operators.push({
            type: "TERM",
            value: nextToken.replace(/"/g, ""),
            negate: true,
          })
        }
        i++ // Skip next token
        continue
      }

      // Handle field-specific search (field:value)
      if (token.includes(":")) {
        const [field, value] = token.split(":", 2)
        operators.push({
          type: "FIELD",
          field: field.toLowerCase(),
          value: value.replace(/"/g, ""),
        })
        continue
      }

      // Handle exact match (quoted strings)
      if (token.startsWith('"') && token.endsWith('"')) {
        operators.push({
          type: "EXACT",
          value: token.slice(1, -1),
        })
        continue
      }

      // Handle AND/OR operators
      if (token.toUpperCase() === "AND" || token.toUpperCase() === "OR") {
        operators.push({
          type: token.toUpperCase() as "AND" | "OR",
          value: token,
        })
        continue
      }

      // Regular term
      operators.push({
        type: "TERM",
        value: token,
      })
    }

    return operators
  }, [])

  // Check if asset matches a single operator
  const matchesOperator = React.useCallback((asset: Asset, operator: SearchOperator): boolean => {
    const { type, field, value, negate } = operator
    let matches = false

    switch (type) {
      case "FIELD":
        switch (field) {
          case "category":
            matches = asset.category.toLowerCase().includes(value.toLowerCase())
            break
          case "protocol":
          case "protocols":
            matches = (asset.protocol || []).some((p) => p.toLowerCase().includes(value.toLowerCase()))
            break
          case "codec":
          case "codecs":
            matches = (asset.codec || []).some((c) => c.toLowerCase().includes(value.toLowerCase()))
            break
          case "host":
            matches = asset.host.toLowerCase().includes(value.toLowerCase())
            break
          case "hdr":
            matches = asset.hdr?.toLowerCase().includes(value.toLowerCase()) || false
            break
          case "container":
            matches = asset.container?.toLowerCase().includes(value.toLowerCase()) || false
            break
          case "resolution":
            matches = asset.resolution?.label?.toLowerCase().includes(value.toLowerCase()) || false
            break
          case "features":
          case "feature":
            matches = (asset.features || []).some((f) => f.toLowerCase().includes(value.toLowerCase()))
            break
          case "notes":
            matches = asset.notes?.toLowerCase().includes(value.toLowerCase()) || false
            break
          default:
            matches = false
        }
        break

      case "EXACT":
        const exactValue = value.toLowerCase()
        matches = [
          asset.category,
          ...(asset.protocol || []),
          ...(asset.codec || []),
          asset.host,
          asset.hdr,
          asset.container,
          asset.resolution?.label,
          ...(asset.features || []),
          asset.notes,
        ].some((field) => field?.toLowerCase() === exactValue)
        break

      case "TERM":
        const termValue = value.toLowerCase()
        matches = [
          asset.category,
          ...(asset.protocol || []),
          ...(asset.codec || []),
          asset.host,
          asset.hdr,
          asset.container,
          asset.resolution?.label,
          ...(asset.features || []),
          asset.notes,
        ].some((field) => field?.toLowerCase().includes(termValue))
        break

      default:
        matches = false
    }

    return negate ? !matches : matches
  }, [])

  // Filter assets based on parsed operators
  const filteredAssets = React.useMemo(() => {
    if (!searchQuery.trim()) return assets

    const operators = parseSearchQuery(searchQuery)
    if (operators.length === 0) return assets

    return assets.filter((asset) => {
      let result = true
      let currentLogic: "AND" | "OR" = "AND"

      for (const operator of operators) {
        if (operator.type === "AND" || operator.type === "OR") {
          currentLogic = operator.type
          continue
        }

        const matches = matchesOperator(asset, operator)

        if (currentLogic === "AND") {
          result = result && matches
        } else {
          result = result || matches
        }
      }

      return result
    })
  }, [assets, searchQuery, parseSearchQuery, matchesOperator])

  // Save search to history
  const addToHistory = React.useCallback((query: string) => {
    if (!query.trim()) return

    setSearchHistory((prev) => {
      const newHistory = [query, ...prev.filter((h) => h !== query)].slice(0, 10)
      localStorage.setItem("video-assets-search-history", JSON.stringify(newHistory))
      return newHistory
    })
  }, [])

  // Save search
  const saveSearch = React.useCallback((name: string, query: string) => {
    const newSearch: SavedSearch = {
      id: Date.now().toString(),
      name,
      query,
      createdAt: new Date(),
      lastUsed: new Date(),
    }

    setSavedSearches((prev) => {
      const updated = [...prev, newSearch]
      localStorage.setItem("video-assets-saved-searches", JSON.stringify(updated))
      return updated
    })
  }, [])

  // Load saved search
  const loadSavedSearch = React.useCallback(
    (id: string) => {
      setSavedSearches((prev) => {
        const updated = prev.map((search) => (search.id === id ? { ...search, lastUsed: new Date() } : search))
        localStorage.setItem("video-assets-saved-searches", JSON.stringify(updated))
        return updated
      })

      return savedSearches.find((s) => s.id === id)?.query || ""
    },
    [savedSearches],
  )

  // Delete saved search
  const deleteSavedSearch = React.useCallback((id: string) => {
    setSavedSearches((prev) => {
      const updated = prev.filter((s) => s.id !== id)
      localStorage.setItem("video-assets-saved-searches", JSON.stringify(updated))
      return updated
    })
  }, [])

  return {
    filteredAssets,
    resultCount: filteredAssets.length,
    savedSearches,
    searchHistory,
    addToHistory,
    saveSearch,
    loadSavedSearch,
    deleteSavedSearch,
    parseSearchQuery,
  }
}
