"use client"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { TrendingUp, Award, AlertCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { QualityScore } from "@/lib/types"

interface QualityScoreBadgeProps {
  score: QualityScore
  variant?: "compact" | "detailed"
}

export function QualityScoreBadge({ score, variant = "compact" }: QualityScoreBadgeProps) {
  const getGradeColor = (grade: QualityScore["grade"]) => {
    switch (grade) {
      case "A+":
        return "bg-emerald-500 text-white"
      case "A":
        return "bg-green-500 text-white"
      case "B+":
        return "bg-lime-500 text-white"
      case "B":
        return "bg-yellow-500 text-white"
      case "C+":
        return "bg-orange-500 text-white"
      case "C":
        return "bg-red-500 text-white"
      case "D":
        return "bg-red-600 text-white"
      case "F":
        return "bg-red-700 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-600"
    if (score >= 80) return "text-green-600"
    if (score >= 70) return "text-lime-600"
    if (score >= 60) return "text-yellow-600"
    if (score >= 50) return "text-orange-600"
    return "text-red-600"
  }

  if (variant === "compact") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1">
              <Badge className={`${getGradeColor(score.grade)} font-bold`}>{score.grade}</Badge>
              <span className={`text-sm font-medium ${getScoreColor(score.overall)}`}>{score.overall}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <div className="space-y-2">
              <div className="font-medium">Quality Breakdown</div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Protocol:</span>
                  <span>{score.breakdown.protocol}/20</span>
                </div>
                <div className="flex justify-between">
                  <span>Codec:</span>
                  <span>{score.breakdown.codec}/25</span>
                </div>
                <div className="flex justify-between">
                  <span>Resolution:</span>
                  <span>{score.breakdown.resolution}/20</span>
                </div>
                <div className="flex justify-between">
                  <span>HDR:</span>
                  <span>{score.breakdown.hdr}/15</span>
                </div>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Quality Score
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`${getGradeColor(score.grade)} font-bold text-lg px-3 py-1`}>{score.grade}</Badge>
            <span className={`text-2xl font-bold ${getScoreColor(score.overall)}`}>{score.overall}</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Score Breakdown */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Score Breakdown</h4>
          <div className="space-y-2">
            {Object.entries(score.breakdown).map(([category, value]) => {
              const maxValues = {
                protocol: 20,
                codec: 25,
                resolution: 20,
                hdr: 15,
                container: 10,
                features: 10,
              }
              const max = maxValues[category as keyof typeof maxValues]
              const percentage = (value / max) * 100

              return (
                <div key={category} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="capitalize">{category}</span>
                    <span className="font-medium">
                      {value}/{max}
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              )
            })}
          </div>
        </div>

        <Separator />

        {/* Recommendations */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Recommendations
          </h4>
          <div className="space-y-2">
            {score.recommendations.map((rec, index) => (
              <div key={index} className="flex items-start gap-2 text-sm">
                <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
