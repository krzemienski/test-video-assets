"use client"

import type * as React from "react"
import { FileVideo, Gauge, Home, Settings, Sparkles, Plus, Monitor, Cpu, HardDrive, Globe, Shield } from "lucide-react"
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
      icon: HLSIcon,
      filter: { protocol: ["hls"] },
    },
    {
      title: "DASH",
      icon: DASHIcon,
      filter: { protocol: ["dash"] },
    },
    {
      title: "CMAF",
      icon: CMAFIcon,
      filter: { protocol: ["cmaf"] },
    },
    {
      title: "Smooth Streaming",
      icon: Gauge,
      filter: { protocol: ["smooth"] },
    },
    {
      title: "Direct Files",
      icon: FileVideo,
      filter: { protocol: ["file"] },
    },
  ],
  resolutions: [
    {
      title: "8K (4320p)",
      icon: Resolution8KIcon,
      filter: { resolution: ["8k", "4320p"] },
    },
    {
      title: "4K (2160p)",
      icon: Resolution4KIcon,
      filter: { resolution: ["4k", "2160p"] },
    },
    {
      title: "Full HD (1080p)",
      icon: Monitor,
      filter: { resolution: ["1080p", "fullhd"] },
    },
    {
      title: "HD (720p)",
      icon: Monitor,
      filter: { resolution: ["720p", "hd"] },
    },
    {
      title: "SD (480p)",
      icon: Monitor,
      filter: { resolution: ["480p", "sd"] },
    },
  ],
  codecs: [
    {
      title: "AV1",
      icon: AV1Icon,
      filter: { codec: ["av1"] },
    },
    {
      title: "HEVC/H.265",
      icon: HEVCIcon,
      filter: { codec: ["hevc", "h265"] },
    },
    {
      title: "H.264/AVC",
      icon: Cpu,
      filter: { codec: ["avc", "h264"] },
    },
    {
      title: "VP9",
      icon: Cpu,
      filter: { codec: ["vp9"] },
    },
    {
      title: "MPEG-2",
      icon: Cpu,
      filter: { codec: ["mpeg2"] },
    },
    {
      title: "VVC/H.266",
      icon: Cpu,
      filter: { codec: ["vvc", "h266"] },
    },
  ],
  containers: [
    {
      title: "MP4",
      icon: HardDrive,
      filter: { container: ["mp4"] },
    },
    {
      title: "WebM",
      icon: HardDrive,
      filter: { container: ["webm"] },
    },
    {
      title: "MKV",
      icon: HardDrive,
      filter: { container: ["mkv"] },
    },
    {
      title: "MOV",
      icon: HardDrive,
      filter: { container: ["mov"] },
    },
  ],
  hdrFormats: [
    {
      title: "SDR",
      icon: Monitor,
      filter: { hdr: ["sdr"] },
    },
    {
      title: "HDR10",
      icon: HDR10Icon,
      filter: { hdr: ["hdr10"] },
    },
    {
      title: "HDR (Generic)",
      icon: Sparkles,
      filter: { hdr: ["hdr"] },
    },
    {
      title: "Dolby Vision",
      icon: DolbyVisionIcon,
      filter: { hdr: ["dovi", "dolby-vision"] },
    },
    {
      title: "HLG",
      icon: Sparkles,
      filter: { hdr: ["hlg"] },
    },
  ],
  schemes: [
    {
      title: "HTTPS",
      icon: Shield,
      filter: { scheme: ["https"] },
    },
    {
      title: "HTTP",
      icon: Globe,
      filter: { scheme: ["http"] },
    },
    {
      title: "RTMP",
      icon: Globe,
      filter: { scheme: ["rtmp"] },
    },
    {
      title: "RTSP",
      icon: Globe,
      filter: { scheme: ["rtsp"] },
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

          <SidebarGroup>
            <SidebarGroupLabel>Resolution</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationData.resolutions.map((item) => (
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

          <SidebarGroup>
            <SidebarGroupLabel>Video Codecs</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationData.codecs.map((item) => (
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

          <SidebarGroup>
            <SidebarGroupLabel>Container Formats</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationData.containers.map((item) => (
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

          <SidebarGroup>
            <SidebarGroupLabel>HDR Formats</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationData.hdrFormats.map((item) => (
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

          <SidebarGroup>
            <SidebarGroupLabel>URL Schemes</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationData.schemes.map((item) => (
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
