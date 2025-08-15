"use client"

import * as React from "react"
import { ExternalLink, Copy, Play, MoreVertical } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { QualityScoreBadge } from "./quality-score-badge"
import { useTouchGestures } from "@/hooks/use-touch-gestures"
import { useToast } from "@/hooks/use-toast"
import type { Asset } from "@/lib/types"

interface MobileAssetCardProps {
  asset: Asset
  onSelect?: (asset: Asset) => void
  onPreview?: (asset: Asset) => void
}

export function MobileAssetCard({ asset, onSelect, onPreview }: MobileAssetCardProps) {
  const { toast } = useToast()
  const [isPressed, setIsPressed] = React.useState(false)

  const gestureHandlers = useTouchGestures({
    onTap: () => onSelect?.(asset),
    onDoubleTap: () => onPreview?.(asset),
    onSwipeLeft: () => handleCopyUrl(),
    onSwipeRight: () => handleOpenUrl(),
  })

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

  const handleOpenUrl = () => {
    window.open(asset.url, "_blank", "noopener,noreferrer")
  }

  return (
    <Card
      className={`cursor-pointer transition-all duration-200 ${
        isPressed ? "scale-95 shadow-sm" : "hover:shadow-md active:scale-95"
      }`}
      onTouchCancel={() => setIsPressed(false)}
      {...gestureHandlers}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-sm truncate">{asset.category}</h3>
              <p className="text-xs text-muted-foreground truncate">{asset.host}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onSelect?.(asset)}>
                  <Play className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopyUrl}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy URL
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleOpenUrl}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Link
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Protocol badges */}
          <div className="flex flex-wrap gap-1">
            {asset.protocol?.slice(0, 3).map((protocol) => (
              <Badge key={protocol} variant="secondary" className="text-xs">
                {protocol.toUpperCase()}
              </Badge>
            ))}
            {asset.protocol && asset.protocol.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{asset.protocol.length - 3}
              </Badge>
            )}
          </div>

          {/* Technical specs */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">Codec:</span>
              <div className="font-medium truncate">
                {asset.codec?.map((c) => c.toUpperCase()).join(", ") || "Unknown"}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Resolution:</span>
              <div className="font-medium truncate">
                {asset.resolution?.label ||
                  (asset.resolution ? `${asset.resolution.width}×${asset.resolution.height}` : "Unknown")}
              </div>
            </div>
          </div>

          {/* Quality score */}
          {asset.qualityScore && (
            <div className="flex justify-between items-center">
              <QualityScoreBadge score={asset.qualityScore} variant="compact" />
              {asset.hdr && asset.hdr !== "sdr" && (
                <Badge variant="outline" className="text-xs">
                  {asset.hdr.toUpperCase()}
                </Badge>
              )}
            </div>
          )}

          {/* Gesture hints */}
          <div className="text-xs text-muted-foreground text-center pt-2 border-t">
            Tap to view • Double tap to preview • Swipe for actions
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
