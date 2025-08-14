"use client"

import type React from "react"

import { useState } from "react"
import { AlertTriangle, Send, Loader2 } from "lucide-react"
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
import { useToast } from "@/hooks/use-toast"
import type { Asset } from "@/lib/types"

interface ReportAssetDialogProps {
  asset: Asset
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ReportAssetDialog({ asset, open, onOpenChange }: ReportAssetDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [description, setDescription] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!description.trim()) {
      toast({
        title: "Description required",
        description: "Please describe the issue with this asset",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/github/create-issue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assetUrl: asset.url,
          assetTitle: asset.category,
          issueType: "broken",
          description: description.trim(),
          userEmail: userEmail.trim() || undefined,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create issue")
      }

      const result = await response.json()

      toast({
        title: "Issue reported successfully",
        description: `GitHub issue #${result.issue.number} has been created. Our team will investigate this asset.`,
      })

      // Reset form and close dialog
      setDescription("")
      setUserEmail("")
      onOpenChange(false)
    } catch (error) {
      console.error("Error reporting asset:", error)
      toast({
        title: "Failed to report issue",
        description: "There was an error creating the GitHub issue. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Report Asset Issue
          </DialogTitle>
          <DialogDescription>
            Report if this asset is broken, inaccessible, or no longer exists. This will create a GitHub issue for
            investigation.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Asset Information */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Asset Details</Label>
            <div className="p-3 bg-muted rounded-md space-y-1">
              <div className="text-sm font-medium">{asset.category}</div>
              <div className="text-xs text-muted-foreground font-mono break-all">{asset.url}</div>
            </div>
          </div>

          {/* Issue Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Issue Description *
            </Label>
            <Textarea
              id="description"
              placeholder="Describe the issue with this asset (e.g., 'Returns 404 error', 'Video won't play', 'Manifest is corrupted')"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
            />
          </div>

          {/* User Email (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Your Email (Optional)
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Provide your email if you'd like updates on the investigation
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating Issue...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Report Issue
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
