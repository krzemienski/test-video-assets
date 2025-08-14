"use client"

import * as React from "react"
import { Search, Save, History, Trash2, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface SavedSearch {
  id: string
  name: string
  query: string
  createdAt: Date
  lastUsed: Date
}

interface AdvancedSearchPanelProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  savedSearches: SavedSearch[]
  searchHistory: string[]
  onSaveSearch: (name: string, query: string) => void
  onLoadSearch: (id: string) => string
  onDeleteSearch: (id: string) => void
  onAddToHistory: (query: string) => void
}

export function AdvancedSearchPanel({
  searchQuery,
  onSearchChange,
  savedSearches,
  searchHistory,
  onSaveSearch,
  onLoadSearch,
  onDeleteSearch,
  onAddToHistory,
}: AdvancedSearchPanelProps) {
  const [saveDialogOpen, setSaveDialogOpen] = React.useState(false)
  const [searchName, setSearchName] = React.useState("")

  const handleSaveSearch = () => {
    if (searchName.trim() && searchQuery.trim()) {
      onSaveSearch(searchName.trim(), searchQuery)
      setSearchName("")
      setSaveDialogOpen(false)
    }
  }

  const handleLoadSearch = (id: string) => {
    const query = onLoadSearch(id)
    if (query) {
      onSearchChange(query)
    }
  }

  const handleHistoryClick = (query: string) => {
    onSearchChange(query)
  }

  const searchExamples = [
    { label: "Field Search", example: "protocol:hls", description: "Search in specific fields" },
    { label: "Exact Match", example: '"4K UHD"', description: "Exact phrase matching" },
    { label: "Boolean AND", example: "hls AND h264", description: "Both terms must match" },
    { label: "Boolean OR", example: "dash OR hls", description: "Either term can match" },
    { label: "Negation", example: "NOT hevc", description: "Exclude results" },
    { label: "Combined", example: "protocol:hls AND NOT codec:hevc", description: "Complex queries" },
  ]

  const availableFields = [
    "category",
    "protocol",
    "codec",
    "host",
    "hdr",
    "container",
    "resolution",
    "features",
    "notes",
  ]

  return (
    <div className="space-y-4">
      {/* Search Input with Advanced Features */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Advanced search... (try: protocol:hls AND codec:h264)"
              className="pl-8 pr-20"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQuery.trim()) {
                  onAddToHistory(searchQuery)
                }
              }}
            />
            <div className="absolute right-2 top-1.5 flex items-center gap-1">
              {/* Save Search Button */}
              <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    disabled={!searchQuery.trim()}
                    title="Save Search"
                  >
                    <Save className="h-3 w-3" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Save Search</DialogTitle>
                    <DialogDescription>Give your search query a name to save it for later use.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="search-name">Search Name</Label>
                      <Input
                        id="search-name"
                        placeholder="e.g., HLS H.264 Assets"
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleSaveSearch()
                          }
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Query</Label>
                      <div className="p-2 bg-muted rounded text-sm font-mono">{searchQuery}</div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSaveSearch} disabled={!searchName.trim()}>
                        Save Search
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Search History */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Search History">
                    <History className="h-3 w-3" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Recent Searches</h4>
                    <ScrollArea className="h-32">
                      {searchHistory.length > 0 ? (
                        <div className="space-y-1">
                          {searchHistory.map((query, index) => (
                            <button
                              key={index}
                              className="w-full text-left p-2 text-sm hover:bg-muted rounded font-mono"
                              onClick={() => handleHistoryClick(query)}
                            >
                              {query}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No recent searches</p>
                      )}
                    </ScrollArea>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {/* Available Fields */}
        <div className="flex flex-wrap gap-1">
          <span className="text-xs text-muted-foreground mr-2">Fields:</span>
          {availableFields.map((field) => (
            <Badge
              key={field}
              variant="outline"
              className="text-xs cursor-pointer hover:bg-muted"
              onClick={() => onSearchChange(`${searchQuery}${searchQuery ? " " : ""}${field}:`)}
            >
              {field}
            </Badge>
          ))}
        </div>
      </div>

      {/* Saved Searches */}
      {savedSearches.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Saved Searches
          </h4>
          <ScrollArea className="h-24">
            <div className="space-y-1">
              {savedSearches
                .sort((a, b) => b.lastUsed.getTime() - a.lastUsed.getTime())
                .map((search) => (
                  <div key={search.id} className="flex items-center justify-between p-2 hover:bg-muted rounded group">
                    <button className="flex-1 text-left" onClick={() => handleLoadSearch(search.id)}>
                      <div className="font-medium text-sm">{search.name}</div>
                      <div className="text-xs text-muted-foreground font-mono">{search.query}</div>
                    </button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                      onClick={() => onDeleteSearch(search.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Search Examples */}
      <div className="space-y-2">
        <h4 className="font-medium text-sm">Search Examples</h4>
        <div className="grid grid-cols-1 gap-2">
          {searchExamples.map((example, index) => (
            <button
              key={index}
              className="text-left p-2 hover:bg-muted rounded group"
              onClick={() => onSearchChange(example.example)}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{example.label}</span>
                <code className="text-xs bg-muted px-1 rounded font-mono group-hover:bg-background">
                  {example.example}
                </code>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{example.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
