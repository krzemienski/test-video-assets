"use client"

import * as React from "react"
import { AlertCircle, BarChart3, Settings, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
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
  const [urlValidated, setUrlValidated] = React.useState(false)
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [canPlay, setCanPlay] = React.useState(false)

  const validateUrl = async (url: string): Promise<boolean> => {
    try {
      addDebugLog(`Validating URL: ${url}`)

      try {
        new URL(url)
      } catch {
        addDebugLog("Invalid URL format")
        return false
      }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const response = await fetch(url, {
        method: "HEAD",
        signal: controller.signal,
        mode: "no-cors",
      })

      clearTimeout(timeoutId)

      addDebugLog("URL validation successful")
      return true
    } catch (error) {
      if (error.name === "AbortError") {
        addDebugLog("URL validation timeout - URL may not exist")
      } else {
        addDebugLog(`URL validation failed: ${error}`)
      }

      if (url.includes(".m3u8") || url.includes(".mpd")) {
        addDebugLog("Streaming URL detected, allowing Video.js to handle validation")
        return true
      }

      return false
    }
  }

  const handleLoadStart = () => {
    setIsLoading(true)
    addDebugLog("Video loading started")
  }

  const handleLoadedMetadata = () => {
    addDebugLog("Loaded metadata")
  }

  const handleLoadedData = () => {
    addDebugLog("Loaded data")
  }

  const handleCanPlay = () => {
    setIsLoading(false)
    setError(null)
    setCanPlay(true)
    addDebugLog("Video can start playing")
  }

  const handleCanPlayThrough = () => {
    addDebugLog("Video can play through")
  }

  const handleError = (e: any) => {
    setIsLoading(false)
    const errorCode = videoRef.current?.error?.code || 0
    let errorMsg = "Video playback error"

    switch (errorCode) {
      case 1:
        errorMsg = "Video loading was aborted"
        break
      case 2:
        errorMsg = "Network error - video URL may not exist or be accessible"
        break
      case 3:
        errorMsg = "Video format is corrupted"
        break
      case 4:
        errorMsg = "Video format is not supported or URL does not exist"
        break
    }

    setError(errorMsg)
    addDebugLog(`Video error (${errorCode}): ${errorMsg}`)
  }

  const handlePlay = () => {
    setIsPlaying(true)
    addDebugLog("Video playback started")
  }

  const handlePause = () => {
    setIsPlaying(false)
    addDebugLog("Video playback paused")
  }

  const handlePlayButtonClick = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
    }
  }

  const handleSeeking = () => {
    addDebugLog("Video seeking")
  }

  const handleSeeked = () => {
    addDebugLog("Video seeked")
  }

  const handleEnded = () => {
    addDebugLog("Video playback ended")
  }

  const handleVolumeChange = () => {
    addDebugLog("Volume changed")
  }

  const handleRateChange = () => {
    addDebugLog("Playback rate changed")
  }

  const handleResize = () => {
    addDebugLog("Video resized")
  }

  const handleFullscreenChange = () => {
    addDebugLog("Fullscreen change")
  }

  const handleVideoTap = (e: React.TouchEvent | React.MouseEvent) => {
    if (videoRef.current && canPlay && !isLoading) {
      e.preventDefault()
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
    }
  }

  React.useEffect(() => {
    const initializePlayer = async () => {
      try {
        if (!videoRef.current) return

        setIsLoading(true)
        setError(null)
        setUrlValidated(false)

        const isValidUrl = await validateUrl(asset.url)
        setUrlValidated(true)

        if (!isValidUrl) {
          setError("Video URL is not accessible or does not exist")
          setIsLoading(false)
          addDebugLog("Skipping video initialization due to invalid URL")
          return
        }

        const videoElement = videoRef.current
        const source = getVideoSource()

        if (!source) {
          setError("Unsupported video format")
          setIsLoading(false)
          return
        }

        await initializeNativeVideo(videoElement, source)

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
      if (playerRef.current) {
        try {
          playerRef.current.dispose()
          playerRef.current = null
        } catch (e) {
          console.warn("Error disposing Video.js player:", e)
        }
      }

      if (videoRef.current) {
        const video = videoRef.current
        video.removeEventListener("loadstart", handleLoadStart)
        video.removeEventListener("loadedmetadata", handleLoadedMetadata)
        video.removeEventListener("loadeddata", handleLoadedData)
        video.removeEventListener("canplay", handleCanPlay)
        video.removeEventListener("canplaythrough", handleCanPlayThrough)
        video.removeEventListener("error", handleError)
        video.removeEventListener("timeupdate", updateStats)
        video.removeEventListener("progress", updateStats)
        video.removeEventListener("play", handlePlay)
        video.removeEventListener("pause", handlePause)
        video.removeEventListener("seeking", handleSeeking)
        video.removeEventListener("seeked", handleSeeked)
        video.removeEventListener("ended", handleEnded)
        video.removeEventListener("volumechange", handleVolumeChange)
        video.removeEventListener("ratechange", handleRateChange)
        video.removeEventListener("resize", handleResize)
        video.removeEventListener("fullscreenchange", handleFullscreenChange)
      }
    }
  }, [asset.url])

  const initializeVideoJS = async (videoElement: HTMLVideoElement, source: { src: string; type: string }) => {
    try {
      const videojs = (await import("video.js")).default

      addDebugLog(`Initializing Video.js for ${source.type}`)

      const player = videojs(videoElement, {
        controls: true,
        preload: "metadata",
        responsive: true,
        fluid: false,
        aspectRatio: "16:9",
        techOrder: ["html5"],
        html5: {
          vhs: {
            overrideNative: true,
            enableLowInitialPlaylist: true,
            smoothQualityChange: true,
            handleManifestRedirects: true,
          },
        },
      })

      playerRef.current = player

      player.ready(() => {
        addDebugLog("Video.js player ready, setting source...")

        player.src({
          src: source.src,
          type: source.type,
        })

        addDebugLog(`Source set: ${source.src} (${source.type})`)

        if (autoplay) {
          player.play().catch((err: any) => {
            addDebugLog(`Autoplay failed: ${err}`)
          })
        }
      })

      player.on("error", (e: any) => {
        const error = player.error()
        if (error) {
          const errorCode = error.code
          const errorMessage = error.message || "Unknown error"

          addDebugLog(`Video.js Error - Code: ${errorCode}, Message: ${errorMessage}`)

          if (errorCode === 2 || errorCode === 4) {
            setError("Video URL is not accessible or does not exist")
            setIsLoading(false)
            return
          }

          addDebugLog("Falling back to native video...")
          player.dispose()
          playerRef.current = null
          initializeNativeVideo(videoElement, source)
        }
      })

      player.on("loadstart", handleLoadStart)
      player.on("canplay", handleCanPlay)
      player.on("timeupdate", updateStats)
      player.on("play", handlePlay)
      player.on("pause", handlePause)
      player.on("ended", handleEnded)
    } catch (err) {
      addDebugLog(`Video.js initialization failed: ${err}`)
      await initializeNativeVideo(videoElement, source)
    }
  }

  const initializeNativeVideo = async (videoElement: HTMLVideoElement, source: { src: string; type: string }) => {
    if (playerRef.current) {
      try {
        playerRef.current.dispose()
        playerRef.current = null
      } catch (e) {
        console.warn("Error disposing Video.js player:", e)
      }
    }

    const isStreamingProtocol = source.type === "application/x-mpegURL" || source.type === "application/dash+xml"

    if (isStreamingProtocol) {
      const canPlay = videoElement.canPlayType(source.type)

      if (canPlay === "" || canPlay === "no") {
        addDebugLog(`Native browser doesn't support ${source.type}, trying Video.js...`)
        try {
          await initializeVideoJS(videoElement, source)
          return
        } catch (err) {
          addDebugLog(`Video.js also failed: ${err}`)
          setError(`Streaming format ${source.type} not supported`)
          return
        }
      }
    }

    videoElement.src = source.src
    addDebugLog(`Loading native video: ${source.src}`)

    videoElement.addEventListener("loadstart", handleLoadStart)
    videoElement.addEventListener("loadedmetadata", handleLoadedMetadata)
    videoElement.addEventListener("loadeddata", handleLoadedData)
    videoElement.addEventListener("canplay", handleCanPlay)
    videoElement.addEventListener("canplaythrough", handleCanPlayThrough)
    videoElement.addEventListener("error", handleError)
    videoElement.addEventListener("timeupdate", updateStats)
    videoElement.addEventListener("play", handlePlay)
    videoElement.addEventListener("pause", handlePause)
    videoElement.addEventListener("seeking", handleSeeking)
    videoElement.addEventListener("seeked", handleSeeked)
    videoElement.addEventListener("ended", handleEnded)
    videoElement.addEventListener("volumechange", handleVolumeChange)
    videoElement.addEventListener("ratechange", handleRateChange)
    videoElement.addEventListener("resize", handleResize)
    videoElement.addEventListener("fullscreenchange", handleFullscreenChange)

    if (autoplay) {
      try {
        await videoElement.play()
      } catch (err) {
        addDebugLog(`Autoplay failed: ${err}`)
      }
    }
  }

  const getVideoSource = () => {
    if (asset.protocol?.includes("hls") || asset.url.includes(".m3u8")) {
      return { src: asset.url, type: "application/x-mpegURL" }
    }
    if (asset.protocol?.includes("dash") || asset.url.includes(".mpd")) {
      return { src: asset.url, type: "application/dash+xml" }
    }

    const extension = asset.url.split(".").pop()?.toLowerCase()
    const mimeTypes: Record<string, string> = {
      mp4: "video/mp4",
      webm: "video/webm",
      ogg: "video/ogg",
      ogv: "video/ogg",
      mov: "video/quicktime",
      avi: "video/x-msvideo",
      mkv: "video/x-matroska",
      m4v: "video/mp4",
      flv: "video/x-flv",
      wmv: "video/x-ms-wmv",
      "3gp": "video/3gpp",
      ts: "video/mp2t",
    }

    const mimeType = mimeTypes[extension || ""]
    if (!mimeType) {
      addDebugLog(`Unknown file extension: ${extension}, defaulting to video/mp4`)
      return { src: asset.url, type: "video/mp4" }
    }

    return { src: asset.url, type: mimeType }
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

    try {
      if (playerRef.current) {
        const player = playerRef.current
        const tech = player.tech()

        if (tech && tech.vhs) {
          const vhs = tech.vhs
          newStats.bitrate = vhs.bandwidth || 0

          if (vhs.stats) {
            newStats.bytesLoaded = vhs.stats.bytesReceived || 0
            newStats.droppedFrames = vhs.stats.videoPlaybackQuality?.droppedVideoFrames || 0
          }

          if (vhs.playlists && vhs.playlists.master) {
            const currentPlaylist = vhs.playlists.master.playlists.find((p: any) => p === vhs.playlists.media())
            if (currentPlaylist) {
              addDebugLog(
                `Current quality: ${currentPlaylist.attributes?.RESOLUTION?.width || "unknown"}x${currentPlaylist.attributes?.RESOLUTION?.height || "unknown"} @ ${Math.round((currentPlaylist.attributes?.BANDWIDTH || 0) / 1000)}kbps`,
              )
            }
          }
        }

        if (player.bufferedPercent) {
          const bufferedPercent = player.bufferedPercent()
          if (bufferedPercent > 0) {
            addDebugLog(`Buffer: ${Math.round(bufferedPercent * 100)}%`)
          }
        }
      }

      const videoElement = video as any
      if (videoElement.webkitDecodedFrameCount !== undefined) {
        newStats.decodedFrames = videoElement.webkitDecodedFrameCount
      }
      if (videoElement.webkitDroppedFrameCount !== undefined) {
        newStats.droppedFrames = videoElement.webkitDroppedFrameCount
      }
      if (videoElement.webkitDisplayedFrameCount !== undefined) {
        newStats.presentedFrames = videoElement.webkitDisplayedFrameCount
      }

      if (newStats.decodedFrames > 0 && newStats.currentTime > 0) {
        newStats.fps = Math.round(newStats.decodedFrames / newStats.currentTime)
      }

      if (videoElement.getVideoPlaybackQuality) {
        const quality = videoElement.getVideoPlaybackQuality()
        newStats.droppedFrames = quality.droppedVideoFrames || newStats.droppedFrames
        newStats.decodedFrames = quality.totalVideoFrames || newStats.decodedFrames
      }
    } catch (e) {
      addDebugLog(`Stats collection error: ${e}`)
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
    const isWebPage = asset.url.match(/\.(html?|php|asp|jsp|cgi)(\?|$)/i)
    if (isWebPage) return false

    const hasWebPageParams = asset.url.match(/[?&](page|view|id|action|module)=/i)
    if (hasWebPageParams) return false

    const hasDirectVideoFile = asset.url.match(/\.(mp4|webm|mov|avi|mkv|m4v|ts)$/i)

    const hasStreamingFile = asset.url.match(/\.(m3u8|mpd)$/i)

    const hasValidStreamingProtocol = asset.protocol?.some(
      (p) => ["hls", "dash", "cmaf"].includes(p) && (hasStreamingFile || asset.url.includes("manifest")),
    )

    const hasFileProtocol = asset.protocol?.includes("file") && hasDirectVideoFile

    return Boolean(hasDirectVideoFile || hasStreamingFile || hasValidStreamingProtocol || hasFileProtocol)
  }, [asset])

  if (!isPreviewable) {
    return (
      <div className={`rounded-lg border bg-card ${className}`}>
        <div className="p-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Preview not available for this asset type. Supported formats: MP4, WebM, MOV, AVI, MKV, HLS (.m3u8), DASH
              (.mpd), and more.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="relative rounded-lg overflow-hidden bg-black touch-manipulation">
        <video
          ref={videoRef}
          className="w-full aspect-video video-js vjs-default-skin"
          controls
          preload="metadata"
          crossOrigin="anonymous"
          style={{ maxHeight: "400px" }}
          onTouchStart={handleVideoTap}
          onClick={handleVideoTap}
          playsInline
        />

        {canPlay && !isPlaying && !isLoading && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 active:bg-black/40 transition-colors cursor-pointer group touch-manipulation"
            onClick={handlePlayButtonClick}
            onTouchEnd={(e) => {
              e.preventDefault()
              handlePlayButtonClick()
            }}
          >
            <div className="w-24 h-24 sm:w-20 sm:h-20 rounded-full bg-white/90 hover:bg-white active:bg-white/80 flex items-center justify-center shadow-lg group-hover:scale-110 group-active:scale-105 transition-transform touch-manipulation">
              <div className="w-0 h-0 border-l-[20px] border-l-black border-t-[15px] border-t-transparent border-b-[15px] border-b-transparent ml-1 sm:border-l-[16px] sm:border-t-[12px] sm:border-b-[12px]"></div>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70">
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
              <div className="text-sm">{!urlValidated ? "Validating video URL..." : "Loading video..."}</div>
            </div>
          </div>
        )}

        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex gap-1">
          {asset.protocol?.map((protocol) => (
            <Badge
              key={protocol}
              variant="secondary"
              className="text-xs bg-black/70 text-white border-white/20 px-2 py-1"
            >
              {protocol.toUpperCase()}
            </Badge>
          ))}
        </div>

        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowStats(!showStats)}
            className="h-10 w-10 sm:h-8 sm:w-auto bg-black/70 text-white border-white/20 hover:bg-black/80 active:bg-black/90 touch-manipulation"
          >
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline ml-1">Stats</span>
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowDebug(!showDebug)}
            className="h-10 w-10 sm:h-8 sm:w-auto bg-black/70 text-white border-white/20 hover:bg-black/80 active:bg-black/90 touch-manipulation"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline ml-1">Debug</span>
          </Button>
        </div>
      </div>

      {error && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            {error.includes("not accessible") && (
              <div className="mt-2 text-sm">
                This may be due to:
                <ul className="list-disc list-inside mt-1">
                  <li>The video file has been moved or deleted</li>
                  <li>Network connectivity issues</li>
                  <li>CORS restrictions on the video server</li>
                  <li>The URL is incorrect or malformed</li>
                </ul>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {(showStats || showDebug) && (
        <Card>
          <CardContent className="p-0">
            <Tabs defaultValue="stats" className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-12 sm:h-10">
                <TabsTrigger value="stats" className="text-sm sm:text-base touch-manipulation">
                  Statistics
                </TabsTrigger>
                <TabsTrigger value="debug" className="text-sm sm:text-base touch-manipulation">
                  Debug Info
                </TabsTrigger>
              </TabsList>

              <TabsContent value="stats" className="p-3 sm:p-4">
                <ScrollArea className="h-48 sm:h-64">
                  {stats ? (
                    <div className="space-y-3 sm:space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2 text-sm sm:text-base">
                          <Info className="h-4 w-4" />
                          Playback Statistics
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
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
                          {stats.bitrate > 0 && (
                            <div>
                              <span className="text-muted-foreground">Bitrate:</span>
                              <div className="font-mono">{Math.round(stats.bitrate / 1000)} kbps</div>
                            </div>
                          )}
                          {stats.fps > 0 && (
                            <div>
                              <span className="text-muted-foreground">FPS:</span>
                              <div className="font-mono">{stats.fps}</div>
                            </div>
                          )}
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="font-semibold mb-2 text-sm sm:text-base">Buffer Information</h4>
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
                            <h4 className="font-semibold mb-2 text-sm sm:text-base">Frame Statistics</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
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

                      {stats.bytesLoaded > 0 && (
                        <>
                          <Separator />
                          <div>
                            <h4 className="font-semibold mb-2 text-sm sm:text-base">Data Usage</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Bytes Loaded:</span>
                                <div className="font-mono">{formatBytes(stats.bytesLoaded)}</div>
                              </div>
                              {stats.bytesTotal > 0 && (
                                <div>
                                  <span className="text-muted-foreground">Total Size:</span>
                                  <div className="font-mono">{formatBytes(stats.bytesTotal)}</div>
                                </div>
                              )}
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

              <TabsContent value="debug" className="p-3 sm:p-4">
                <ScrollArea className="h-48 sm:h-64">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-sm sm:text-base">Debug Log</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDebugLogs([])}
                        className="h-8 px-3 touch-manipulation"
                      >
                        Clear
                      </Button>
                    </div>
                    {debugLogs.length > 0 ? (
                      <div className="space-y-1">
                        {debugLogs.map((log, index) => (
                          <div key={index} className="text-xs font-mono bg-muted p-2 rounded break-all">
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
          </CardContent>
        </Card>
      )}
    </div>
  )
}
