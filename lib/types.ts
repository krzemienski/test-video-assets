// Shared type definitions for the Video Test Assets Portal

export type Protocol = "hls" | "dash" | "smooth" | "cmaf" | "file" | "other"
export type Codec = "avc" | "hevc" | "av1" | "vp9" | "mpeg2" | "vvc" | "other"
export type Hdr = "hdr10" | "hlg" | "dovi" | "hdr" | "sdr"
export type Container = "mp4" | "ts" | "mkv" | "webm" | "mov" | "yuv" | "other"
export type Scheme = "https" | "http" | "ftp" | "rtmp" | "rtsp" | "other"

export interface Asset {
  id: string
  url: string
  host: string
  scheme: Scheme
  category: string // Numeric category ID as string
  protocol: Protocol[] // Changed from protocols to protocol (array)
  container: Container | null // Allow null values
  codec: Codec[] // Changed from codecs to codec (array)
  resolution: {
    width: number | null
    height: number | null
    label: string
  } | null // Allow null resolution
  hdr: Hdr // Required field (not optional)
  notes: string // Required field (not optional)
  features: string[]
  qualityScore?: QualityScore
}

export interface FacetCounts {
  protocol: Record<string, number> // Changed from protocols to protocol
  codec: Record<string, number> // Changed from codecs to codec
  container: Record<string, number> // Changed from containers to container
  hdr: Record<string, number>
  resolution: Record<string, number> // Changed from resolutions to resolution
  host: Record<string, number> // Changed from hosts to host
  scheme: Record<string, number> // Changed from schemes to scheme
}

export interface CategoryMap {
  [categoryId: string]: string
}

export interface Metadata {
  version: string
  buildTimestamp: string
  totalAssets: number
  sourceUrl?: string
}

export interface FilterState {
  search: string
  protocol: Protocol[] // Changed from protocols
  codec: Codec[] // Changed from codecs
  resolution: string[] // Changed from resolutions
  hdr: Hdr[]
  container: Container[] // Changed from containers
  host: string[] // Changed from hosts
  scheme: Scheme[] // Changed from schemes
}

export interface UIState {
  viewMode: "table" | "cards"
  sortBy: "category" | "host" | "protocol" | "codec" | "resolution" | "hdr"
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

export interface ProcessedAssetData {
  assets: Asset[]
  facets: FacetCounts
  categories: CategoryMap
  metadata: Metadata
}
