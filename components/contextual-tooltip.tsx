"use client"

import * as React from "react"
import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ContextualTooltipProps {
  content: string
  aiExplanation?: string
  children: React.ReactNode
  side?: "top" | "right" | "bottom" | "left"
}

export function ContextualTooltip({ content, aiExplanation, children, side = "top" }: ContextualTooltipProps) {
  const [showAiExplanation, setShowAiExplanation] = React.useState(false)

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side={side} className="max-w-xs">
          <div className="space-y-2">
            <p className="text-sm">{content}</p>

            {aiExplanation && (
              <>
                {showAiExplanation ? (
                  <div className="border-t pt-2">
                    <div className="flex items-center gap-1 mb-1">
                      <Sparkles className="h-3 w-3 text-primary" />
                      <span className="text-xs font-medium text-primary">AI Insight</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{aiExplanation}</p>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs p-1"
                    onClick={() => setShowAiExplanation(true)}
                  >
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI Explain
                  </Button>
                )}
              </>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
