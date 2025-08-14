"use client"

import * as React from "react"
import type { Asset, QualityScore, Protocol, Codec, Hdr, Container } from "@/lib/types"

// Quality scoring weights and criteria
const SCORING_WEIGHTS = {
  protocol: 20,
  codec: 25,
  resolution: 20,
  hdr: 15,
  container: 10,
  features: 10,
}

const PROTOCOL_SCORES: Record<Protocol, number> = {
  cmaf: 20,
  dash: 18,
  hls: 16,
  smooth: 12,
  file: 8,
  other: 5,
}

const CODEC_SCORES: Record<Codec, number> = {
  av1: 25,
  vvc: 24,
  hevc: 20,
  vp9: 18,
  avc: 15,
  mpeg2: 8,
  other: 5,
}

const HDR_SCORES: Record<Hdr, number> = {
  dovi: 15,
  hdr10: 12,
  hlg: 10,
  hdr: 8,
  sdr: 5,
}

const CONTAINER_SCORES: Record<Container, number> = {
  mp4: 10,
  mkv: 9,
  webm: 8,
  mov: 7,
  ts: 6,
  yuv: 4,
  other: 3,
}

const RESOLUTION_SCORES: Record<string, number> = {
  "8K": 20,
  "4K": 18,
  "2K": 15,
  "1080p": 12,
  "720p": 8,
  "480p": 5,
  "360p": 3,
}

export function useQualityScoring() {
  const calculateQualityScore = React.useCallback((asset: Asset): QualityScore => {
    // Protocol score (best protocol gets full points)
    const protocolScore = Math.max(...asset.protocols.map((p) => PROTOCOL_SCORES[p] || 0))

    // Codec score (best codec gets full points)
    const codecScore = asset.codecs?.length ? Math.max(...asset.codecs.map((c) => CODEC_SCORES[c] || 0)) : 0

    // Resolution score
    let resolutionScore = 0
    if (asset.resolution) {
      const { width, height } = asset.resolution
      if (width >= 7680) resolutionScore = RESOLUTION_SCORES["8K"]
      else if (width >= 3840) resolutionScore = RESOLUTION_SCORES["4K"]
      else if (width >= 2560) resolutionScore = RESOLUTION_SCORES["2K"]
      else if (width >= 1920) resolutionScore = RESOLUTION_SCORES["1080p"]
      else if (width >= 1280) resolutionScore = RESOLUTION_SCORES["720p"]
      else if (width >= 640) resolutionScore = RESOLUTION_SCORES["480p"]
      else resolutionScore = RESOLUTION_SCORES["360p"]
    }

    // HDR score
    const hdrScore = asset.hdr ? HDR_SCORES[asset.hdr] || 0 : 0

    // Container score
    const containerScore = asset.container ? CONTAINER_SCORES[asset.container] || 0 : 0

    // Features score (more features = better)
    const featuresScore = Math.min(asset.features.length * 2, SCORING_WEIGHTS.features)

    // Calculate overall score
    const overall = protocolScore + codecScore + resolutionScore + hdrScore + containerScore + featuresScore

    // Determine grade
    let grade: QualityScore["grade"]
    if (overall >= 90) grade = "A+"
    else if (overall >= 85) grade = "A"
    else if (overall >= 80) grade = "B+"
    else if (overall >= 70) grade = "B"
    else if (overall >= 60) grade = "C+"
    else if (overall >= 50) grade = "C"
    else if (overall >= 40) grade = "D"
    else grade = "F"

    // Generate recommendations
    const recommendations: string[] = []

    if (protocolScore < 15) {
      recommendations.push("Consider using DASH or HLS for better streaming compatibility")
    }

    if (codecScore < 20) {
      recommendations.push("Upgrade to HEVC or AV1 for better compression efficiency")
    }

    if (resolutionScore < 12) {
      recommendations.push("Higher resolution content provides better viewing experience")
    }

    if (hdrScore < 10) {
      recommendations.push("HDR content offers enhanced visual quality")
    }

    if (asset.features.length < 3) {
      recommendations.push("Additional features like adaptive bitrate improve user experience")
    }

    if (recommendations.length === 0) {
      recommendations.push("Excellent quality asset with modern standards")
    }

    return {
      overall,
      breakdown: {
        protocol: protocolScore,
        codec: codecScore,
        resolution: resolutionScore,
        hdr: hdrScore,
        container: containerScore,
        features: featuresScore,
      },
      grade,
      recommendations,
    }
  }, [])

  const scoreAssets = React.useCallback(
    (assets: Asset[]): Asset[] => {
      return assets.map((asset) => ({
        ...asset,
        qualityScore: calculateQualityScore(asset),
      }))
    },
    [calculateQualityScore],
  )

  const getRecommendations = React.useCallback(
    (assets: Asset[], limit = 5): Asset[] => {
      const scoredAssets = scoreAssets(assets)
      return scoredAssets
        .sort((a, b) => (b.qualityScore?.overall || 0) - (a.qualityScore?.overall || 0))
        .slice(0, limit)
    },
    [scoreAssets],
  )

  const getQualityDistribution = React.useCallback(
    (assets: Asset[]) => {
      const scoredAssets = scoreAssets(assets)
      const distribution = {
        "A+": 0,
        A: 0,
        "B+": 0,
        B: 0,
        "C+": 0,
        C: 0,
        D: 0,
        F: 0,
      }

      scoredAssets.forEach((asset) => {
        if (asset.qualityScore) {
          distribution[asset.qualityScore.grade]++
        }
      })

      return distribution
    },
    [scoreAssets],
  )

  return {
    calculateQualityScore,
    scoreAssets,
    getRecommendations,
    getQualityDistribution,
  }
}
