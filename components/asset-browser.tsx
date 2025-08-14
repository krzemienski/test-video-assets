"use client"

import type * as React from "react"
import { ExternalLink, Copy, Play, Database, FileVideo } from "lucide-react"

import type { Asset, Protocol, Hdr } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"

interface AssetBrowserProps {
  assets: Asset[]
  viewMode: "table" | "cards"
  onAssetSelect?: (asset: Asset) => void
}

// Protocol icons mapping
const protocolIcons: Record<Protocol, React.ComponentType<{ className?: string }>> = {
  hls: Play,
  dash: Database,
  smooth: Database,
  cmaf: Database,
  file: FileVideo,
  other: FileVideo,
}

// HDR badge colors
const hdrColors: Record<Hdr, string> = {
  hdr10: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  hlg: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  dovi: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  hdr: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  sdr: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
}

export function AssetBrowser({ assets, viewMode, onAssetSelect }: AssetBrowserProps) {
  const { toast } = useToast()

  const handleCopyUrl = async (url: string, event: React.MouseEvent) => {
    event.stopPropagation()
    try {
      await navigator.clipboard.writeText(url)
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

  const handleOpenUrl = (url: string, event: React.MouseEvent) => {
    event.stopPropagation()
    window.open(url, "_blank", "noopener,noreferrer")
  }

  const formatResolution = (resolution?: { width: number | null; height: number | null; label: string } | null) => {
    if (!resolution) return "Unknown"
    return (
      resolution.label ||
      (resolution.width && resolution.height ? `${resolution.width}×${resolution.height}` : "Unknown")
    )
  }

  const getProtocolBadgeColor = (protocol: Protocol) => {
    const colors = {
      hls: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      dash: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      smooth: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      cmaf: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
      file: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
      other: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
    }
    return colors[protocol]
  }

  const getProtocolArray = (protocol: string[] | null | undefined): string[] => {
    return Array.isArray(protocol) ? protocol : []
  }

  const getCodecArray = (codec: string[] | null | undefined): string[] => {
    return Array.isArray(codec) ? codec : []
  }

  const getFeaturesArray = (features: string[] | null | undefined): string[] => {
    return Array.isArray(features) ? features : []
  }

  if (viewMode === "cards") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assets.map((asset) => {
          const protocolArray = getProtocolArray(asset.protocol)
          const PrimaryProtocolIcon =
            protocolArray.length > 0 ? protocolIcons[protocolArray[0] as Protocol] || FileVideo : FileVideo
          const codecArray = getCodecArray(asset.codec)
          const featuresArray = getFeaturesArray(asset.features)

          return (
            <Card
              key={asset.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onAssetSelect?.(asset)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <PrimaryProtocolIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <CardTitle className="text-sm font-medium truncate">{asset.category}</CardTitle>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => handleCopyUrl(asset.url, e)}
                      title="Copy URL"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => handleOpenUrl(asset.url, e)}
                      title="Open URL"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Protocol badges */}
                  <div className="flex flex-wrap gap-1">
                    {protocolArray.map((protocol) => (
                      <Badge
                        key={protocol}
                        variant="secondary"
                        className={`text-xs ${getProtocolBadgeColor(protocol as Protocol)}`}
                      >
                        {protocol.toUpperCase()}
                      </Badge>
                    ))}
                    {protocolArray.length === 0 && (
                      <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-800">
                        UNKNOWN
                      </Badge>
                    )}
                  </div>

                  {/* Technical specs */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div>
                      <span className="font-medium">Codec:</span>{" "}
                      {codecArray.length > 0 ? codecArray.map((c) => c.toUpperCase()).join(", ") : "Unknown"}
                    </div>
                    <div>
                      <span className="font-medium">Resolution:</span> {formatResolution(asset.resolution)}
                    </div>
                    <div>
                      <span className="font-medium">HDR:</span>{" "}
                      <Badge variant="outline" className={`text-xs ${hdrColors[asset.hdr]}`}>
                        {asset.hdr.toUpperCase()}
                      </Badge>
                    </div>
                    <div>
                      <span className="font-medium">Host:</span> {asset.host}
                    </div>
                  </div>

                  {/* Features */}
                  {featuresArray.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {featuresArray.slice(0, 3).map((feature) => (
                        <Badge key={feature} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                      {featuresArray.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{featuresArray.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
  }

  // Table view
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Category</TableHead>
            <TableHead>Protocol</TableHead>
            <TableHead>Codec</TableHead>
            <TableHead>Resolution</TableHead>
            <TableHead>HDR</TableHead>
            <TableHead>Container</TableHead>
            <TableHead>Host</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assets.map((asset) => {
            const protocolArray = getProtocolArray(asset.protocol)
            const codecArray = getCodecArray(asset.codec)

            return (
              <TableRow
                key={asset.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onAssetSelect?.(asset)}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                    <span className="truncate">{asset.category}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {protocolArray.slice(0, 2).map((protocol) => (
                      <Badge
                        key={protocol}
                        variant="secondary"
                        className={`text-xs ${getProtocolBadgeColor(protocol as Protocol)}`}
                      >
                        {protocol.toUpperCase()}
                      </Badge>
                    ))}
                    {protocolArray.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{protocolArray.length - 2}
                      </Badge>
                    )}
                    {protocolArray.length === 0 && (
                      <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-800">
                        UNKNOWN
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {codecArray.length > 0 ? codecArray.map((c) => c.toUpperCase()).join(", ") : "Unknown"}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{formatResolution(asset.resolution)}</span>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`text-xs ${hdrColors[asset.hdr]}`}>
                    {asset.hdr.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{asset.container?.toUpperCase() || "Unknown"}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground truncate max-w-[120px]" title={asset.host}>
                    {asset.host}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => handleCopyUrl(asset.url, e)}
                      title="Copy URL"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => handleOpenUrl(asset.url, e)}
                      title="Open URL"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
