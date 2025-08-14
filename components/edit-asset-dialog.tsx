"use client"

import type React from "react"

import { useState } from "react"
import { Edit, Send, Loader2 } from "lucide-react"
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

interface EditAssetDialogProps {
  asset: Asset
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditAssetDialog({ asset, open, onOpenChange }: EditAssetDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editDescription, setEditDescription] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!editDescription.trim()) {
      toast({
        title: "Description required",
        description: "Please describe what changes you'd like to make to this asset",
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
          issueType: "edit",
          description: editDescription.trim(),
          userEmail: userEmail.trim() || undefined,
          additionalData: {
            currentAsset: asset,
          },
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create edit request")
      }

      const result = await response.json()

      toast({
        title: "Edit request submitted",
        description: `GitHub issue #${result.issue.number} has been created. Your suggested changes will be reviewed.`,
      })

      // Reset form and close dialog
      setEditDescription("")
      setUserEmail("")
      onOpenChange(false)
    } catch (error) {
      console.error("Error submitting edit request:", error)
      toast({
        title: "Failed to submit edit request",
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
            <Edit className="h-5 w-5 text-blue-500" />
            Suggest Asset Edit
          </DialogTitle>
          <DialogDescription>
            Suggest changes or corrections to this asset's information. This will create a GitHub issue for review.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Asset Information */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Current Asset</Label>
            <div className="p-3 bg-muted rounded-md space-y-1">
              <div className="text-sm font-medium">{asset.category}</div>
              <div className="text-xs text-muted-foreground font-mono break-all">{asset.url}</div>
              <div className="text-xs text-muted-foreground">
                {asset.protocol?.join(", ")} • {asset.codec?.join(", ")} •{" "}
                {asset.resolution?.label || "Unknown resolution"}
              </div>
            </div>
          </div>

          {/* Edit Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Suggested Changes *
            </Label>
            <Textarea
              id="description"
              placeholder="Describe the changes you'd like to make (e.g., 'Update title to...', 'Add HDR10 support', 'Correct resolution to 4K', 'Asset URL has changed to...')"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
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
              Provide your email if you'd like updates on your edit request
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
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Edit Request
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
