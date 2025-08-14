"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Star, ExternalLink } from "lucide-react"
import { QualityScoreBadge } from "./quality-score-badge"
import type { Asset } from "@/lib/types"

interface RecommendationsPanelProps {
  recommendations: Asset[]
  onAssetSelect?: (asset: Asset) => void
}

export function RecommendationsPanel({ recommendations, onAssetSelect }: RecommendationsPanelProps) {
  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Top Quality Assets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No assets available for recommendations.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5" />
          Top Quality Assets
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80">
          <div className="space-y-3">
            {recommendations.map((asset, index) => (
              <div
                key={asset.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      #{index + 1}
                    </Badge>
                    <span className="font-medium text-sm truncate">{asset.category}</span>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    {asset.protocols.slice(0, 2).map((protocol) => (
                      <Badge key={protocol} variant="secondary" className="text-xs">
                        {protocol.toUpperCase()}
                      </Badge>
                    ))}
                    {asset.codecs?.slice(0, 1).map((codec) => (
                      <Badge key={codec} variant="outline" className="text-xs">
                        {codec.toUpperCase()}
                      </Badge>
                    ))}
                    {asset.resolution && (
                      <Badge variant="outline" className="text-xs">
                        {asset.resolution.label || `${asset.resolution.width}x${asset.resolution.height}`}
                      </Badge>
                    )}
                  </div>

                  {asset.qualityScore && <QualityScoreBadge score={asset.qualityScore} variant="compact" />}
                </div>

                <div className="flex items-center gap-2 ml-3">
                  <Button variant="ghost" size="sm" onClick={() => window.open(asset.url, "_blank")} title="Open Asset">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  {onAssetSelect && (
                    <Button variant="outline" size="sm" onClick={() => onAssetSelect(asset)}>
                      View Details
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
