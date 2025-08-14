"use client"

import type * as React from "react"
import { FileVideo, Gauge, Home, Settings, Sparkles, Plus } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ContributeAssetDialog } from "./contribute-asset-dialog"
import { GitHubRepoInfo } from "./github-repo-info"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"

import {
  VideoTestAssetsLogo,
  HLSIcon,
  DASHIcon,
  CMAFIcon,
  Resolution4KIcon,
  Resolution8KIcon,
  HDR10Icon,
  AV1Icon,
  HEVCIcon,
  DolbyVisionIcon,
} from "./icons/custom-icons"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  onFilterChange?: (filters: Record<string, string[]>) => void
}

// Navigation data with filter configurations
const navigationData = {
  main: [
    {
      title: "All Assets",
      url: "/",
      icon: Home,
      isActive: true,
    },
  ],
  protocols: [
    {
      title: "HLS",
      icon: HLSIcon, // Use custom HLS icon
      filter: { protocols: ["hls"] },
    },
    {
      title: "DASH",
      icon: DASHIcon, // Use custom DASH icon
      filter: { protocols: ["dash"] },
    },
    {
      title: "CMAF",
      icon: CMAFIcon, // Use custom CMAF icon
      filter: { protocols: ["cmaf"] },
    },
    {
      title: "Smooth Streaming",
      icon: Gauge,
      filter: { protocols: ["smooth"] },
    },
  ],
  videoSpecs: [
    {
      title: "4K Assets",
      icon: Resolution4KIcon, // Use custom 4K icon
      filter: { resolutions: ["4k", "2160p"] },
    },
    {
      title: "8K Assets",
      icon: Resolution8KIcon, // Use custom 8K icon
      filter: { resolutions: ["8k", "4320p"] },
    },
    {
      title: "H.264/AVC",
      icon: FileVideo,
      filter: { codecs: ["avc", "h264"] },
    },
    {
      title: "HEVC/H.265",
      icon: HEVCIcon, // Use custom HEVC icon
      filter: { codecs: ["hevc", "h265"] },
    },
    {
      title: "AV1",
      icon: AV1Icon, // Use custom AV1 icon
      filter: { codecs: ["av1"] },
    },
  ],
  advancedFeatures: [
    {
      title: "HDR10",
      icon: HDR10Icon, // Use custom HDR10 icon
      filter: { hdr: ["hdr10"] },
    },
    {
      title: "HLG",
      icon: Sparkles,
      filter: { hdr: ["hlg"] },
    },
    {
      title: "Dolby Vision",
      icon: DolbyVisionIcon, // Use custom Dolby Vision icon
      filter: { hdr: ["dolby-vision", "dovi"] },
    },
  ],
  resources: [
    {
      title: "Documentation",
      url: "/resources",
      icon: Settings,
    },
    {
      title: "Tools & Players",
      url: "/resources",
      icon: Settings,
    },
  ],
}

export function AppSidebar({ onFilterChange, ...props }: AppSidebarProps) {
  const [contributeDialogOpen, setContributeDialogOpen] = useState(false)

  const handleFilterClick = (filter: Record<string, string[]>) => {
    if (onFilterChange) {
      onFilterChange(filter)
    }
  }

  const handleClearFilters = () => {
    if (onFilterChange) {
      onFilterChange({})
    }
  }

  return (
    <>
      <Sidebar variant="inset" {...props}>
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-2">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <VideoTestAssetsLogo className="size-6" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">Video Test Assets</span>
              <span className="truncate text-xs text-sidebar-foreground/70">Portal</span>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          {/* Main Navigation */}
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationData.main.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={item.isActive}>
                      <a href={item.url} onClick={handleClearFilters}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator />

          {/* Streaming Protocols */}
          <SidebarGroup>
            <SidebarGroupLabel>Streaming Protocols</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationData.protocols.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton onClick={() => handleFilterClick(item.filter)}>
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Video Specifications */}
          <SidebarGroup>
            <SidebarGroupLabel>Video Specs</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationData.videoSpecs.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton onClick={() => handleFilterClick(item.filter)}>
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Advanced Features */}
          <SidebarGroup>
            <SidebarGroupLabel>Advanced Features</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationData.advancedFeatures.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton onClick={() => handleFilterClick(item.filter)}>
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Resources */}
          <SidebarGroup>
            <SidebarGroupLabel>Resources</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationData.resources.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <div className="p-2 space-y-3">
            <GitHubRepoInfo />

            {/* Contribute Button */}
            <Button
              variant="outline"
              size="sm"
              className="w-full text-green-600 border-green-200 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:border-green-800 dark:hover:text-green-300 dark:hover:bg-green-950 bg-transparent"
              onClick={() => setContributeDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Contribute Asset
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>

      <ContributeAssetDialog open={contributeDialogOpen} onOpenChange={setContributeDialogOpen} />
    </>
  )
}
