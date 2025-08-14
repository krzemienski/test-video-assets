"use client"

import type React from "react"

import { useState } from "react"
import { Plus, Send, Loader2, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ContributeAssetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface AssetContribution {
  url: string
  title: string
  category: string
  protocols: string[]
  codecs: string[]
  resolution: string
  hdr: string
  container: string
  features: string[]
  notes: string
  userEmail: string
}

const PROTOCOL_OPTIONS = [
  { value: "hls", label: "HLS" },
  { value: "dash", label: "DASH" },
  { value: "smooth", label: "Smooth Streaming" },
  { value: "cmaf", label: "CMAF" },
  { value: "file", label: "Direct File" },
]

const CODEC_OPTIONS = [
  { value: "avc", label: "H.264/AVC" },
  { value: "hevc", label: "HEVC/H.265" },
  { value: "av1", label: "AV1" },
  { value: "vp9", label: "VP9" },
  { value: "vp8", label: "VP8" },
]

const RESOLUTION_OPTIONS = [
  { value: "8k", label: "8K (7680×4320)" },
  { value: "4k", label: "4K (3840×2160)" },
  { value: "1080p", label: "1080p (1920×1080)" },
  { value: "720p", label: "720p (1280×720)" },
  { value: "480p", label: "480p (854×480)" },
  { value: "360p", label: "360p (640×360)" },
  { value: "custom", label: "Custom Resolution" },
]

const HDR_OPTIONS = [
  { value: "sdr", label: "SDR (Standard Dynamic Range)" },
  { value: "hdr10", label: "HDR10" },
  { value: "hlg", label: "HLG (Hybrid Log-Gamma)" },
  { value: "dovi", label: "Dolby Vision" },
  { value: "hdr", label: "Generic HDR" },
]

const FEATURE_OPTIONS = [
  "multi-bitrate",
  "adaptive",
  "live",
  "vod",
  "drm",
  "subtitles",
  "multiple-audio",
  "thumbnails",
  "chapters",
  "360-video",
  "vr",
  "ultra-low-latency",
]

export function ContributeAssetDialog({ open, onOpenChange }: ContributeAssetDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<AssetContribution>({
    url: "",
    title: "",
    category: "",
    protocols: [],
    codecs: [],
    resolution: "",
    hdr: "sdr",
    container: "",
    features: [],
    notes: "",
    userEmail: "",
  })
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.url.trim() || !formData.title.trim()) {
      toast({
        title: "Required fields missing",
        description: "Please provide at least a URL and title for the asset",
        variant: "destructive",
      })
      return
    }

    // Validate URL format
    try {
      new URL(formData.url)
    } catch {
      toast({
        title: "Invalid URL",
        description: "Please provide a valid URL for the asset",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const contributionDetails = `
**Asset Information:**
- **URL:** ${formData.url}
- **Title:** ${formData.title}
- **Category:** ${formData.category || "Not specified"}

**Technical Specifications:**
- **Protocols:** ${formData.protocols.length ? formData.protocols.join(", ") : "Not specified"}
- **Codecs:** ${formData.codecs.length ? formData.codecs.join(", ") : "Not specified"}
- **Resolution:** ${formData.resolution || "Not specified"}
- **HDR:** ${formData.hdr}
- **Container:** ${formData.container || "Not specified"}

**Features:**
${formData.features.length ? formData.features.map((f) => `- ${f}`).join("\n") : "- None specified"}

**Additional Notes:**
${formData.notes || "No additional notes provided"}

**Contributor Email:** ${formData.userEmail || "Not provided"}
      `.trim()

      const response = await fetch("/api/github/create-issue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assetUrl: formData.url,
          assetTitle: formData.title,
          issueType: "contribution",
          description: contributionDetails,
          userEmail: formData.userEmail.trim() || undefined,
          additionalData: formData,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create contribution")
      }

      const result = await response.json()

      toast({
        title: "Asset contribution submitted",
        description: `GitHub issue #${result.issue.number} has been created. Thank you for your contribution!`,
      })

      // Reset form and close dialog
      setFormData({
        url: "",
        title: "",
        category: "",
        protocols: [],
        codecs: [],
        resolution: "",
        hdr: "sdr",
        container: "",
        features: [],
        notes: "",
        userEmail: "",
      })
      onOpenChange(false)
    } catch (error) {
      console.error("Error submitting contribution:", error)
      toast({
        title: "Failed to submit contribution",
        description: "There was an error creating the GitHub issue. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleProtocolChange = (protocol: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      protocols: checked ? [...prev.protocols, protocol] : prev.protocols.filter((p) => p !== protocol),
    }))
  }

  const handleCodecChange = (codec: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      codecs: checked ? [...prev.codecs, codec] : prev.codecs.filter((c) => c !== codec),
    }))
  }

  const handleFeatureChange = (feature: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      features: checked ? [...prev.features, feature] : prev.features.filter((f) => f !== feature),
    }))
  }

  return (
    <TooltipProvider>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-green-500" />
              Contribute New Asset
            </DialogTitle>
            <DialogDescription>
              Submit a new video test asset to be added to the database. All contributions are reviewed before being
              added.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Basic Information</h3>

              <div className="space-y-2">
                <Label htmlFor="url" className="text-sm font-medium">
                  Asset URL *
                </Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://example.com/video.m3u8"
                  value={formData.url}
                  onChange={(e) => setFormData((prev) => ({ ...prev, url: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">
                  Asset Title *
                </Label>
                <Input
                  id="title"
                  placeholder="e.g., Big Buck Bunny 4K HDR"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium">
                  Category
                </Label>
                <Input
                  id="category"
                  placeholder="e.g., Test Pattern, Movie Trailer, Live Stream"
                  value={formData.category}
                  onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                />
              </div>
            </div>

            {/* Technical Specifications */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Technical Specifications</h3>

              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  Streaming Protocols
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-3 w-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Select all protocols this asset supports</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {PROTOCOL_OPTIONS.map((protocol) => (
                    <div key={protocol.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`protocol-${protocol.value}`}
                        checked={formData.protocols.includes(protocol.value)}
                        onCheckedChange={(checked) => handleProtocolChange(protocol.value, checked as boolean)}
                      />
                      <Label htmlFor={`protocol-${protocol.value}`} className="text-sm">
                        {protocol.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Video Codecs</Label>
                <div className="grid grid-cols-2 gap-2">
                  {CODEC_OPTIONS.map((codec) => (
                    <div key={codec.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`codec-${codec.value}`}
                        checked={formData.codecs.includes(codec.value)}
                        onCheckedChange={(checked) => handleCodecChange(codec.value, checked as boolean)}
                      />
                      <Label htmlFor={`codec-${codec.value}`} className="text-sm">
                        {codec.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Resolution</Label>
                  <Select
                    value={formData.resolution}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, resolution: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select resolution" />
                    </SelectTrigger>
                    <SelectContent>
                      {RESOLUTION_OPTIONS.map((res) => (
                        <SelectItem key={res.value} value={res.value}>
                          {res.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">HDR Support</Label>
                  <Select
                    value={formData.hdr}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, hdr: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {HDR_OPTIONS.map((hdr) => (
                        <SelectItem key={hdr.value} value={hdr.value}>
                          {hdr.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="container" className="text-sm font-medium">
                  Container Format
                </Label>
                <Input
                  id="container"
                  placeholder="e.g., mp4, ts, webm"
                  value={formData.container}
                  onChange={(e) => setFormData((prev) => ({ ...prev, container: e.target.value }))}
                />
              </div>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Features</h3>
              <div className="grid grid-cols-2 gap-2">
                {FEATURE_OPTIONS.map((feature) => (
                  <div key={feature} className="flex items-center space-x-2">
                    <Checkbox
                      id={`feature-${feature}`}
                      checked={formData.features.includes(feature)}
                      onCheckedChange={(checked) => handleFeatureChange(feature, checked as boolean)}
                    />
                    <Label htmlFor={`feature-${feature}`} className="text-sm">
                      {feature}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Additional Information</h3>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-medium">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional information about this asset (e.g., special requirements, known issues, source)"
                  value={formData.notes}
                  onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Your Email (Optional)
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.userEmail}
                  onChange={(e) => setFormData((prev) => ({ ...prev, userEmail: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">
                  Provide your email to receive updates on your contribution
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Contribution
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}
