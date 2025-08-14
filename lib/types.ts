// Shared type definitions for the Video Test Assets Portal

export type Protocol = "hls" | "dash" | "smooth" | "cmaf" | "file" | "other"
export type Codec = "avc" | "hevc" | "av1" | "vp9" | "mpeg2" | "vvc" | "other"
export type Hdr = "hdr10" | "hlg" | "dovi" | "hdr" | "sdr"
export type Container = "mp4" | "ts" | "mkv" | "webm" | "mov" | "yuv" | "other"

export interface Asset {
  id: string
  url: string
  host: string
  scheme: "https" | "http" | "ftp" | "rtmp" | "rtsp" | "other"
  category: string
  protocols: Protocol[]
  container?: Container
  codecs?: Codec[]
  resolution?: { width: number; height: number; label?: string }
  hdr?: Hdr
  notes?: string
  features: string[]
  qualityScore?: QualityScore
}

export interface FacetCounts {
  protocols: Record<Protocol, number>
  codecs: Record<Codec, number>
  resolutions: Record<string, number>
  hdr: Record<Hdr, number>
  containers: Record<Container, number>
  hosts: Record<string, number>
  schemes: Record<string, number>
}

export interface Metadata {
  version: string
  buildTimestamp: string
  totalAssets: number
  sourceUrl?: string
}

// Filter state interface
export interface FilterState {
  search: string
  protocols: Protocol[]
  codecs: Codec[]
  resolutions: string[]
  hdr: Hdr[]
  containers: Container[]
  hosts: string[]
  schemes: string[]
}

// UI state interface
export interface UIState {
  viewMode: "table" | "cards"
  sortBy: "category" | "host" | "protocols" | "codecs" | "resolution"
  sortOrder: "asc" | "desc"
  selectedAsset?: Asset
}

export interface QualityScore {
  overall: number // 0-100
  breakdown: {
    protocol: number // 0-20
    codec: number // 0-25
    resolution: number // 0-20
    hdr: number // 0-15
    container: number // 0-10
    features: number // 0-10
  }
  grade: "A+" | "A" | "B+" | "B" | "C+" | "C" | "D" | "F"
  recommendations: string[]
}
