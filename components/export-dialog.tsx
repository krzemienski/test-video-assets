"use client"

import * as React from "react"
import { Download, FileText, Database, Table, File } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useExport, type ExportFormat } from "@/hooks/use-export"
import type { Asset } from "@/lib/types"

interface ExportDialogProps {
  assets: Asset[]
  filteredCount: number
  children?: React.ReactNode
}

const formatOptions = [
  { value: "csv" as ExportFormat, label: "CSV", icon: Table, description: "Comma-separated values for spreadsheets" },
  {
    value: "json" as ExportFormat,
    label: "JSON",
    icon: Database,
    description: "Structured data format for developers",
  },
  { value: "excel" as ExportFormat, label: "Excel", icon: FileText, description: "Tab-separated format for Excel" },
  { value: "txt" as ExportFormat, label: "Text", icon: File, description: "Human-readable text format" },
]

const availableFields = [
  { key: "id", label: "ID" },
  { key: "category", label: "Category" },
  { key: "url", label: "URL" },
  { key: "host", label: "Host" },
  { key: "scheme", label: "Scheme" },
  { key: "protocol", label: "Protocol" }, // Updated from protocols to protocol
  { key: "codec", label: "Codec" }, // Updated from codecs to codec
  { key: "container", label: "Container" },
  { key: "resolution", label: "Resolution" },
  { key: "hdr", label: "HDR" },
  { key: "features", label: "Features" },
  { key: "notes", label: "Notes" },
]

export function ExportDialog({ assets, filteredCount, children }: ExportDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [format, setFormat] = React.useState<ExportFormat>("csv")
  const [includeQualityScores, setIncludeQualityScores] = React.useState(true)
  const [includeRecommendations, setIncludeRecommendations] = React.useState(false)
  const [selectedFields, setSelectedFields] = React.useState<string[]>(availableFields.map((f) => f.key))
  const [isExporting, setIsExporting] = React.useState(false)

  const { handleExport } = useExport()
  const { toast } = useToast()

  const handleFieldToggle = (fieldKey: string, checked: boolean) => {
    setSelectedFields((prev) => (checked ? [...prev, fieldKey] : prev.filter((f) => f !== fieldKey)))
  }

  const handleSelectAll = () => {
    setSelectedFields(availableFields.map((f) => f.key))
  }

  const handleSelectNone = () => {
    setSelectedFields([])
  }

  const handleExportClick = async () => {
    if (selectedFields.length === 0) {
      toast({
        title: "No fields selected",
        description: "Please select at least one field to export",
        variant: "destructive",
      })
      return
    }

    setIsExporting(true)
    try {
      const success = handleExport(assets, {
        format,
        includeQualityScores,
        includeRecommendations,
        selectedFields,
      })

      if (success) {
        toast({
          title: "Export successful",
          description: `${assets.length} assets exported as ${format.toUpperCase()}`,
        })
        setOpen(false)
      } else {
        toast({
          title: "Export failed",
          description: "There was an error exporting the data",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was an error exporting the data",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Assets</DialogTitle>
          <DialogDescription>
            Export {filteredCount.toLocaleString()} filtered assets in your preferred format.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Export Format</Label>
            <RadioGroup value={format} onValueChange={(value) => setFormat(value as ExportFormat)}>
              {formatOptions.map((option) => {
                const Icon = option.icon
                return (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label htmlFor={option.value} className="flex items-center gap-2 cursor-pointer flex-1">
                      <Icon className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-muted-foreground">{option.description}</div>
                      </div>
                    </Label>
                  </div>
                )
              })}
            </RadioGroup>
          </div>

          <Separator />

          {/* Additional Options */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Additional Data</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="quality-scores"
                  checked={includeQualityScores}
                  onCheckedChange={setIncludeQualityScores}
                />
                <Label htmlFor="quality-scores" className="text-sm cursor-pointer">
                  Include quality scores and grades
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="recommendations"
                  checked={includeRecommendations}
                  onCheckedChange={setIncludeRecommendations}
                />
                <Label htmlFor="recommendations" className="text-sm cursor-pointer">
                  Include quality recommendations
                </Label>
              </div>
            </div>
          </div>

          <Separator />

          {/* Field Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Fields to Export</Label>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={handleSelectAll} className="h-6 text-xs">
                  All
                </Button>
                <Button variant="ghost" size="sm" onClick={handleSelectNone} className="h-6 text-xs">
                  None
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
              {availableFields.map((field) => (
                <div key={field.key} className="flex items-center space-x-2">
                  <Checkbox
                    id={field.key}
                    checked={selectedFields.includes(field.key)}
                    onCheckedChange={(checked) => handleFieldToggle(field.key, !!checked)}
                  />
                  <Label htmlFor={field.key} className="text-sm cursor-pointer">
                    {field.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleExportClick} disabled={isExporting || selectedFields.length === 0}>
            {isExporting ? "Exporting..." : "Export"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
