"use client"
import { Copy, ExternalLink, Download, Share, Info, Code, Tag } from "lucide-react"
import { VideoPreview } from "@/components/video-preview"

import type { Asset } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

interface AssetDetailDrawerProps {
  asset: Asset | undefined
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AssetDetailDrawer({ asset, open, onOpenChange }: AssetDetailDrawerProps) {
  const { toast } = useToast()

  if (!asset) return null

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(asset.url)
      toast({
        title: "URL copied",
        description: "Asset URL has been copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy URL to clipboard",
        variant: "destructive",
      })
    }
  }

  const handleCopySummary = async () => {
    const summary = [
      asset.protocols?.map((p) => p.toUpperCase()).join(" + "),
      asset.codecs?.map((c) => c.toUpperCase()).join(" + "),
      asset.resolution?.label || "Unknown Resolution",
      asset.hdr && asset.hdr !== "sdr" ? asset.hdr.toUpperCase() : null,
    ]
      .filter(Boolean)
      .join(" • ")

    try {
      await navigator.clipboard.writeText(summary)
      toast({
        title: "Summary copied",
        description: "Asset summary has been copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy summary to clipboard",
        variant: "destructive",
      })
    }
  }

  const handleCopyManifest = async () => {
    const manifestExample = generateManifestExample(asset)
    if (!manifestExample) {
      toast({
        title: "No manifest available",
        description: "This asset type doesn't have a manifest example",
        variant: "destructive",
      })
      return
    }

    try {
      await navigator.clipboard.writeText(manifestExample)
      toast({
        title: "Manifest copied",
        description: "Manifest example has been copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy manifest to clipboard",
        variant: "destructive",
      })
    }
  }

  const handleOpenUrl = () => {
    window.open(asset.url, "_blank", "noopener,noreferrer")
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: asset.category,
          text: `Video test asset: ${asset.category}`,
          url: asset.url,
        })
      } catch (error) {
        // Fallback to copy URL
        handleCopyUrl()
      }
    } else {
      handleCopyUrl()
    }
  }

  const formatResolution = (resolution?: { width: number; height: number; label?: string }) => {
    if (!resolution) return "Unknown"
    return resolution.label || `${resolution.width}×${resolution.height}`
  }

  const getProtocolBadgeColor = (protocol: string) => {
    const colors = {
      hls: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      dash: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      smooth: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      cmaf: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
      file: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
      other: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
    }
    return colors[protocol as keyof typeof colors] || colors.other
  }

  const getHdrBadgeColor = (hdr: string) => {
    const colors = {
      hdr10: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      hlg: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      dovi: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      hdr: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      sdr: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
    }
    return colors[hdr as keyof typeof colors] || colors.sdr
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[600px] sm:w-[700px]">
        <SheetHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-lg font-semibold pr-8">{asset.category}</SheetTitle>
              <SheetDescription className="text-sm text-muted-foreground mt-1">
                {asset.host} • {asset.scheme.toUpperCase()}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="technical" className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                Technical
              </TabsTrigger>
              <TabsTrigger value="raw" className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Raw Data
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[calc(100vh-200px)] mt-4">
              <TabsContent value="overview" className="space-y-4">
                {/* Video Preview */}
                {(asset.protocols?.includes("hls") ||
                  asset.protocols?.includes("dash") ||
                  asset.protocols?.includes("file") ||
                  asset.url.match(/\.(mp4|webm|ogg|mov|avi|mkv|m3u8|mpd)$/i)) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Video Preview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <VideoPreview asset={asset} className="border-0 shadow-none" />
                    </CardContent>
                  </Card>
                )}

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Button onClick={handleOpenUrl} className="flex items-center gap-2">
                        <ExternalLink className="h-4 w-4" />
                        Open Asset
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCopyUrl}
                        className="flex items-center gap-2 bg-transparent"
                      >
                        <Copy className="h-4 w-4" />
                        Copy URL
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCopySummary}
                        className="flex items-center gap-2 bg-transparent"
                      >
                        <Download className="h-4 w-4" />
                        Copy Summary
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleShare}
                        className="flex items-center gap-2 bg-transparent"
                      >
                        <Share className="h-4 w-4" />
                        Share
                      </Button>
                    </div>
                    {(asset.protocols?.includes("hls") || asset.protocols?.includes("dash")) && (
                      <Button
                        variant="outline"
                        onClick={handleCopyManifest}
                        className="flex items-center gap-2 bg-transparent"
                      >
                        <Code className="h-4 w-4" />
                        Copy Manifest Example
                      </Button>
                    )}
                  </CardContent>
                </Card>

                {/* Protocol Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Streaming Protocols</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {asset.protocols?.map((protocol) => (
                        <Badge key={protocol} className={getProtocolBadgeColor(protocol)}>
                          {protocol.toUpperCase()}
                        </Badge>
                      )) || <span className="text-muted-foreground">No protocols specified</span>}
                    </div>
                  </CardContent>
                </Card>

                {/* Video Specifications */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Video Specifications</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">Codec</div>
                        <div className="mt-1">
                          {asset.codecs?.length ? (
                            <div className="flex flex-wrap gap-1">
                              {asset.codecs.map((codec) => (
                                <Badge key={codec} variant="secondary">
                                  {codec === "avc"
                                    ? "H.264/AVC"
                                    : codec === "hevc"
                                      ? "HEVC/H.265"
                                      : codec.toUpperCase()}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Unknown</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">Resolution</div>
                        <div className="mt-1">
                          <Badge variant="outline">{formatResolution(asset.resolution)}</Badge>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">HDR Support</div>
                        <div className="mt-1">
                          <Badge className={getHdrBadgeColor(asset.hdr || "sdr")}>
                            {asset.hdr === "dovi" ? "Dolby Vision" : (asset.hdr || "sdr").toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">Container</div>
                        <div className="mt-1">
                          <Badge variant="outline">{asset.container?.toUpperCase() || "Unknown"}</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Features */}
                {asset.features && asset.features.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Features</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {asset.features.map((feature) => (
                          <Badge key={feature} variant="outline">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Notes */}
                {asset.notes && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{asset.notes}</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="technical" className="space-y-4">
                {/* URL Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">URL Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Full URL</div>
                      <div className="mt-1 p-2 bg-muted rounded text-sm font-mono break-all">{asset.url}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">Host</div>
                        <div className="mt-1 text-sm">{asset.host}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">Scheme</div>
                        <div className="mt-1">
                          <Badge variant="outline">{asset.scheme.toUpperCase()}</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Resolution Details */}
                {asset.resolution && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Resolution Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <div className="text-sm font-medium text-muted-foreground">Width</div>
                          <div className="mt-1 text-sm">{asset.resolution.width}px</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-muted-foreground">Height</div>
                          <div className="mt-1 text-sm">{asset.resolution.height}px</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-muted-foreground">Aspect Ratio</div>
                          <div className="mt-1 text-sm">
                            {(asset.resolution.width / asset.resolution.height).toFixed(2)}:1
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Manifest Example */}
                {(asset.protocols?.includes("hls") || asset.protocols?.includes("dash")) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Manifest Example</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                        <code>{generateManifestExample(asset)}</code>
                      </pre>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="raw" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Raw Asset Data</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                      <code>{JSON.stringify(asset, null, 2)}</code>
                    </pre>
                  </CardContent>
                </Card>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function generateManifestExample(asset: Asset): string | null {
  if (asset.protocols?.includes("hls")) {
    return `// HLS Manifest Example
const video = document.createElement('video');
video.src = '${asset.url}';
video.controls = true;
document.body.appendChild(video);

// Or with HLS.js
import Hls from 'hls.js';

if (Hls.isSupported()) {
  const hls = new Hls();
  hls.loadSource('${asset.url}');
  hls.attachMedia(video);
}`
  }

  if (asset.protocols?.includes("dash")) {
    return `// DASH Manifest Example
import dashjs from 'dashjs';

const video = document.createElement('video');
video.controls = true;
document.body.appendChild(video);

const player = dashjs.MediaPlayer().create();
player.initialize(video, '${asset.url}', true);`
  }

  return null
}
