"use client"

import * as React from "react"
import { AlertCircle, BarChart3, Settings, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import type { Asset } from "@/lib/types"

interface VideoPreviewProps {
  asset: Asset
  autoplay?: boolean
  className?: string
}

interface VideoStats {
  currentTime: number
  duration: number
  buffered: TimeRanges | null
  videoWidth: number
  videoHeight: number
  playbackRate: number
  volume: number
  networkState: number
  readyState: number
  bytesLoaded: number
  bytesTotal: number
  droppedFrames: number
  decodedFrames: number
  presentedFrames: number
  bitrate: number
  fps: number
}

export function VideoPreview({ asset, autoplay = false, className }: VideoPreviewProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const playerRef = React.useRef<any>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [showStats, setShowStats] = React.useState(false)
  const [showDebug, setShowDebug] = React.useState(false)
  const [stats, setStats] = React.useState<VideoStats | null>(null)
  const [debugLogs, setDebugLogs] = React.useState<string[]>([])

  React.useEffect(() => {
    const initializePlayer = async () => {
      try {
        if (!videoRef.current) return

        const videoElement = videoRef.current

        // Set video source directly based on asset type
        const source = getVideoSource()
        if (source) {
          videoElement.src = source.src
          addDebugLog(`Loading ${source.type}: ${source.src}`)
        }

        // Add event listeners
        videoElement.addEventListener("loadstart", () => {
          setIsLoading(true)
          addDebugLog("Video loading started")
        })

        videoElement.addEventListener("canplay", () => {
          setIsLoading(false)
          setError(null)
          addDebugLog("Video can start playing")
        })

        videoElement.addEventListener("error", (e) => {
          setIsLoading(false)
          const errorMsg = videoElement.error?.message || "Unknown video error"
          setError(errorMsg)
          addDebugLog(`Error: ${errorMsg}`)
        })

        videoElement.addEventListener("timeupdate", updateStats)
        videoElement.addEventListener("progress", updateStats)
        videoElement.addEventListener("play", () => addDebugLog("Playback started"))
        videoElement.addEventListener("pause", () => addDebugLog("Playback paused"))
        videoElement.addEventListener("seeking", () => addDebugLog("Seeking"))
        videoElement.addEventListener("seeked", () => addDebugLog("Seek completed"))

        if (autoplay) {
          try {
            await videoElement.play()
          } catch (err) {
            addDebugLog(`Autoplay failed: ${err}`)
          }
        }

        setIsLoading(false)
      } catch (err) {
        console.error("Failed to initialize video player:", err)
        setError("Failed to initialize video player")
        addDebugLog(`Initialization error: ${err}`)
        setIsLoading(false)
      }
    }

    initializePlayer()

    return () => {
      if (videoRef.current) {
        const video = videoRef.current
        video.removeEventListener("loadstart", () => {})
        video.removeEventListener("canplay", () => {})
        video.removeEventListener("error", () => {})
        video.removeEventListener("timeupdate", updateStats)
        video.removeEventListener("progress", updateStats)
      }
    }
  }, [asset.url])

  const getVideoSource = () => {
    if (asset.protocols?.includes("hls") || asset.url.includes(".m3u8")) {
      return { src: asset.url, type: "application/x-mpegURL" }
    }
    if (asset.protocols?.includes("dash") || asset.url.includes(".mpd")) {
      return { src: asset.url, type: "application/dash+xml" }
    }

    // Handle direct file URLs
    const extension = asset.url.split(".").pop()?.toLowerCase()
    const mimeTypes: Record<string, string> = {
      mp4: "video/mp4",
      webm: "video/webm",
      ogg: "video/ogg",
      mov: "video/quicktime",
      avi: "video/x-msvideo",
      mkv: "video/x-matroska",
    }

    return { src: asset.url, type: mimeTypes[extension || ""] || "video/mp4" }
  }

  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setDebugLogs((prev) => [...prev.slice(-49), `[${timestamp}] ${message}`])
  }

  const updateStats = () => {
    const video = videoRef.current
    if (!video) return

    const newStats: VideoStats = {
      currentTime: video.currentTime,
      duration: video.duration || 0,
      buffered: video.buffered,
      videoWidth: video.videoWidth,
      videoHeight: video.videoHeight,
      playbackRate: video.playbackRate,
      volume: video.volume,
      networkState: video.networkState,
      readyState: video.readyState,
      bytesLoaded: 0,
      bytesTotal: 0,
      droppedFrames: 0,
      decodedFrames: 0,
      presentedFrames: 0,
      bitrate: 0,
      fps: 0,
    }

    // Get additional stats from Video.js if available
    try {
      const videoElement = video as any
      if (videoElement.webkitDecodedFrameCount) {
        newStats.decodedFrames = videoElement.webkitDecodedFrameCount
      }
      if (videoElement.webkitDroppedFrameCount) {
        newStats.droppedFrames = videoElement.webkitDroppedFrameCount
      }
    } catch (e) {
      // Ignore errors accessing webkit properties
    }

    setStats(newStats)
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const formatTime = (time: number) => {
    if (!time || !isFinite(time)) return "0:00"
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const getBufferedRanges = () => {
    if (!stats?.buffered) return []
    const ranges = []
    for (let i = 0; i < stats.buffered.length; i++) {
      ranges.push({
        start: stats.buffered.start(i),
        end: stats.buffered.end(i),
      })
    }
    return ranges
  }

  const isPreviewable = React.useMemo(() => {
    const hasVideoExtension = asset.url.match(/\.(mp4|webm|ogg|mov|avi|mkv|m3u8|mpd)$/i)
    const hasStreamingProtocol = asset.protocols?.some((p) => ["hls", "dash", "file"].includes(p))
    return Boolean(hasVideoExtension || hasStreamingProtocol)
  }, [asset])

  if (!isPreviewable) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Preview not available for this asset type. Supported formats: MP4, WebM, HLS (.m3u8), DASH (.mpd)
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Video Preview</CardTitle>
          <div className="flex items-center gap-2">
            {asset.protocols?.map((protocol) => (
              <Badge key={protocol} variant="secondary" className="text-xs">
                {protocol.toUpperCase()}
              </Badge>
            ))}
            <Button variant="outline" size="sm" onClick={() => setShowStats(!showStats)} className="h-8">
              <BarChart3 className="h-4 w-4 mr-1" />
              Stats
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowDebug(!showDebug)} className="h-8">
              <Settings className="h-4 w-4 mr-1" />
              Debug
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative">
          <video
            ref={videoRef}
            className="w-full aspect-video bg-black"
            controls
            preload="metadata"
            crossOrigin="anonymous"
            style={{ maxHeight: "400px" }}
          />

          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="text-white">Loading video...</div>
            </div>
          )}

          {error && (
            <div className="p-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          )}
        </div>

        {(showStats || showDebug) && (
          <div className="border-t">
            <Tabs defaultValue="stats" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="stats">Statistics</TabsTrigger>
                <TabsTrigger value="debug">Debug Info</TabsTrigger>
              </TabsList>

              <TabsContent value="stats" className="p-4">
                <ScrollArea className="h-64">
                  {stats ? (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Info className="h-4 w-4" />
                          Playback Statistics
                        </h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Current Time:</span>
                            <div className="font-mono">{formatTime(stats.currentTime)}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Duration:</span>
                            <div className="font-mono">{formatTime(stats.duration)}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Resolution:</span>
                            <div className="font-mono">
                              {stats.videoWidth}×{stats.videoHeight}
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Playback Rate:</span>
                            <div className="font-mono">{stats.playbackRate}x</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Volume:</span>
                            <div className="font-mono">{Math.round(stats.volume * 100)}%</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Network State:</span>
                            <div className="font-mono">{stats.networkState}</div>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="font-semibold mb-2">Buffer Information</h4>
                        <div className="space-y-2 text-sm">
                          {getBufferedRanges().map((range, index) => (
                            <div key={index} className="flex justify-between">
                              <span className="text-muted-foreground">Range {index + 1}:</span>
                              <span className="font-mono">
                                {formatTime(range.start)} - {formatTime(range.end)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {(stats.decodedFrames > 0 || stats.droppedFrames > 0) && (
                        <>
                          <Separator />
                          <div>
                            <h4 className="font-semibold mb-2">Frame Statistics</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Decoded Frames:</span>
                                <div className="font-mono">{stats.decodedFrames.toLocaleString()}</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Dropped Frames:</span>
                                <div className="font-mono">{stats.droppedFrames.toLocaleString()}</div>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">No statistics available</div>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="debug" className="p-4">
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">Debug Log</h4>
                      <Button variant="outline" size="sm" onClick={() => setDebugLogs([])}>
                        Clear
                      </Button>
                    </div>
                    {debugLogs.length > 0 ? (
                      <div className="space-y-1">
                        {debugLogs.map((log, index) => (
                          <div key={index} className="text-xs font-mono bg-muted p-2 rounded">
                            {log}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground py-8">No debug information available</div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
