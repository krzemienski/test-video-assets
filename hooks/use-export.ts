"use client"

import * as React from "react"
import type { Asset } from "@/lib/types"

export type ExportFormat = "csv" | "json" | "excel" | "txt"

interface ExportOptions {
  format: ExportFormat
  includeQualityScores?: boolean
  includeRecommendations?: boolean
  selectedFields?: string[]
}

export function useExport() {
  const exportAssets = React.useCallback((assets: Asset[], options: ExportOptions) => {
    const { format, includeQualityScores = false, includeRecommendations = false, selectedFields } = options

    // Filter fields if specified
    const processedAssets = selectedFields
      ? assets.map((asset) => {
          const filtered: any = {}
          selectedFields.forEach((field) => {
            if (field in asset) {
              filtered[field] = asset[field as keyof Asset]
            }
          })
          return filtered
        })
      : assets

    switch (format) {
      case "csv":
        return exportToCsv(processedAssets, includeQualityScores, includeRecommendations)
      case "json":
        return exportToJson(processedAssets)
      case "excel":
        return exportToExcel(processedAssets, includeQualityScores, includeRecommendations)
      case "txt":
        return exportToTxt(processedAssets)
      default:
        throw new Error(`Unsupported export format: ${format}`)
    }
  }, [])

  const exportToCsv = (assets: Asset[], includeQualityScores: boolean, includeRecommendations: boolean) => {
    if (assets.length === 0) return ""

    const headers = [
      "ID",
      "Category",
      "URL",
      "Host",
      "Scheme",
      "Protocols",
      "Codecs",
      "Container",
      "Resolution",
      "HDR",
      "Features",
      "Notes",
    ]

    if (includeQualityScores) {
      headers.push("Quality Score", "Quality Grade")
    }

    if (includeRecommendations) {
      headers.push("Recommendations")
    }

    const csvContent = [
      headers.join(","),
      ...assets.map((asset) => {
        const row = [
          `"${asset.id}"`,
          `"${asset.category}"`,
          `"${asset.url}"`,
          `"${asset.host}"`,
          `"${asset.scheme}"`,
          `"${asset.protocols.join("; ")}"`,
          `"${asset.codecs?.join("; ") || ""}"`,
          `"${asset.container || ""}"`,
          `"${asset.resolution?.label || asset.resolution ? `${asset.resolution.width}x${asset.resolution.height}` : ""}"`,
          `"${asset.hdr || ""}"`,
          `"${asset.features.join("; ")}"`,
          `"${asset.notes || ""}"`,
        ]

        if (includeQualityScores && asset.qualityScore) {
          row.push(`"${asset.qualityScore.overall}"`, `"${asset.qualityScore.grade}"`)
        } else if (includeQualityScores) {
          row.push('""', '""')
        }

        if (includeRecommendations && asset.qualityScore) {
          row.push(`"${asset.qualityScore.recommendations.join("; ")}"`)
        } else if (includeRecommendations) {
          row.push('""')
        }

        return row.join(",")
      }),
    ].join("\n")

    return csvContent
  }

  const exportToJson = (assets: Asset[]) => {
    return JSON.stringify(assets, null, 2)
  }

  const exportToExcel = (assets: Asset[], includeQualityScores: boolean, includeRecommendations: boolean) => {
    // For Excel, we'll create a tab-separated format that can be opened in Excel
    if (assets.length === 0) return ""

    const headers = [
      "ID",
      "Category",
      "URL",
      "Host",
      "Scheme",
      "Protocols",
      "Codecs",
      "Container",
      "Resolution",
      "HDR",
      "Features",
      "Notes",
    ]

    if (includeQualityScores) {
      headers.push("Quality Score", "Quality Grade")
    }

    if (includeRecommendations) {
      headers.push("Recommendations")
    }

    const tsvContent = [
      headers.join("\t"),
      ...assets.map((asset) => {
        const row = [
          asset.id,
          asset.category,
          asset.url,
          asset.host,
          asset.scheme,
          asset.protocols.join("; "),
          asset.codecs?.join("; ") || "",
          asset.container || "",
          asset.resolution?.label || asset.resolution ? `${asset.resolution.width}x${asset.resolution.height}` : "",
          asset.hdr || "",
          asset.features.join("; "),
          asset.notes || "",
        ]

        if (includeQualityScores && asset.qualityScore) {
          row.push(asset.qualityScore.overall.toString(), asset.qualityScore.grade)
        } else if (includeQualityScores) {
          row.push("", "")
        }

        if (includeRecommendations && asset.qualityScore) {
          row.push(asset.qualityScore.recommendations.join("; "))
        } else if (includeRecommendations) {
          row.push("")
        }

        return row.join("\t")
      }),
    ].join("\n")

    return tsvContent
  }

  const exportToTxt = (assets: Asset[]) => {
    return assets
      .map((asset) => {
        const lines = [
          `ID: ${asset.id}`,
          `Category: ${asset.category}`,
          `URL: ${asset.url}`,
          `Host: ${asset.host}`,
          `Scheme: ${asset.scheme}`,
          `Protocols: ${asset.protocols.join(", ")}`,
          `Codecs: ${asset.codecs?.join(", ") || "Unknown"}`,
          `Container: ${asset.container || "Unknown"}`,
          `Resolution: ${asset.resolution?.label || asset.resolution ? `${asset.resolution.width}x${asset.resolution.height}` : "Unknown"}`,
          `HDR: ${asset.hdr || "SDR"}`,
          `Features: ${asset.features.join(", ")}`,
          `Notes: ${asset.notes || "None"}`,
        ]

        if (asset.qualityScore) {
          lines.push(`Quality Score: ${asset.qualityScore.overall} (${asset.qualityScore.grade})`)
          lines.push(`Recommendations: ${asset.qualityScore.recommendations.join("; ")}`)
        }

        return lines.join("\n")
      })
      .join("\n\n" + "=".repeat(50) + "\n\n")
  }

  const downloadFile = React.useCallback((content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [])

  const handleExport = React.useCallback(
    (assets: Asset[], options: ExportOptions) => {
      try {
        const content = exportAssets(assets, options)
        const timestamp = new Date().toISOString().split("T")[0]
        const baseFilename = `video-assets-${timestamp}`

        const mimeTypes = {
          csv: "text/csv",
          json: "application/json",
          excel: "application/vnd.ms-excel",
          txt: "text/plain",
        }

        const extensions = {
          csv: "csv",
          json: "json",
          excel: "xls",
          txt: "txt",
        }

        const filename = `${baseFilename}.${extensions[options.format]}`
        const mimeType = mimeTypes[options.format]

        downloadFile(content, filename, mimeType)
        return true
      } catch (error) {
        console.error("Export failed:", error)
        return false
      }
    },
    [exportAssets, downloadFile],
  )

  return {
    exportAssets,
    handleExport,
  }
}
