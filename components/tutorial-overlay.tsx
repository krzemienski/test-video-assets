"use client"

import * as React from "react"
import { X, ArrowRight, ArrowLeft, Lightbulb, Search, SlidersHorizontal, Grid3X3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface TutorialStep {
  id: string
  title: string
  description: string
  target: string
  position: "top" | "bottom" | "left" | "right"
  icon: React.ComponentType<{ className?: string }>
}

const tutorialSteps: TutorialStep[] = [
  {
    id: "welcome",
    title: "Welcome to Video Test Assets Portal",
    description: "Let's take a quick tour to help you get started with browsing and managing video test assets.",
    target: "body",
    position: "top",
    icon: Lightbulb,
  },
  {
    id: "search",
    title: "Advanced Search",
    description:
      "Use the search bar to find assets. Try advanced operators like 'protocol:hls' or 'codec:hevc' for precise results.",
    target: 'input[type="search"]',
    position: "bottom",
    icon: Search,
  },
  {
    id: "filters",
    title: "Filter Assets",
    description: "Click the filters button to narrow down assets by protocol, codec, resolution, HDR, and more.",
    target: '[title="Filters"]',
    position: "bottom",
    icon: SlidersHorizontal,
  },
  {
    id: "view-modes",
    title: "View Modes",
    description: "Switch between table and card views to see assets in your preferred layout.",
    target: '[title="Card View"]',
    position: "bottom",
    icon: Grid3X3,
  },
  {
    id: "sidebar",
    title: "Navigation Sidebar",
    description: "Use the sidebar to quickly navigate between different asset categories and access resources.",
    target: '[data-sidebar="sidebar"]',
    position: "right",
    icon: ArrowRight,
  },
]

interface TutorialOverlayProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

export function TutorialOverlay({ isOpen, onClose, onComplete }: TutorialOverlayProps) {
  const [currentStep, setCurrentStep] = React.useState(0)
  const [highlightedElement, setHighlightedElement] = React.useState<HTMLElement | null>(null)

  const step = tutorialSteps[currentStep]
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100

  React.useEffect(() => {
    if (!isOpen) return

    const element = document.querySelector(step.target) as HTMLElement
    if (element) {
      setHighlightedElement(element)
      element.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }, [currentStep, step.target, isOpen])

  React.useEffect(() => {
    if (!isOpen) {
      setHighlightedElement(null)
      return
    }

    // Add overlay styles
    document.body.style.overflow = "hidden"

    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    onComplete()
    onClose()
  }

  const handleSkip = () => {
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-50" />

      {/* Highlight overlay */}
      {highlightedElement && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            top: highlightedElement.offsetTop - 4,
            left: highlightedElement.offsetLeft - 4,
            width: highlightedElement.offsetWidth + 8,
            height: highlightedElement.offsetHeight + 8,
            border: "2px solid hsl(var(--primary))",
            borderRadius: "8px",
            boxShadow: "0 0 0 4px hsl(var(--primary) / 0.2)",
          }}
        />
      )}

      {/* Tutorial card */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <Card className="w-full max-w-md pointer-events-auto animate-in fade-in-0 zoom-in-95">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <step.icon className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">{step.title}</CardTitle>
              </div>
              <Button variant="ghost" size="sm" onClick={handleSkip} className="h-6 w-6 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Progress value={progress} className="h-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{step.description}</p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {currentStep + 1} of {tutorialSteps.length}
                </Badge>
              </div>

              <div className="flex gap-2">
                {currentStep > 0 && (
                  <Button variant="outline" size="sm" onClick={handlePrevious}>
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                )}
                <Button size="sm" onClick={handleNext}>
                  {currentStep < tutorialSteps.length - 1 ? (
                    <>
                      Next
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </>
                  ) : (
                    "Finish"
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
