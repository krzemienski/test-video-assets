"use client"

import type * as React from "react"
import { Database, FileVideo, Gauge, Home, Monitor, Play, Settings, Sparkles, Video, Zap } from "lucide-react"

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
      icon: Play,
      filter: { protocols: ["hls"] },
    },
    {
      title: "DASH",
      icon: Video,
      filter: { protocols: ["dash"] },
    },
    {
      title: "CMAF",
      icon: Database,
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
      icon: Monitor,
      filter: { resolutions: ["4k", "2160p"] },
    },
    {
      title: "8K Assets",
      icon: Monitor,
      filter: { resolutions: ["8k", "4320p"] },
    },
    {
      title: "H.264/AVC",
      icon: FileVideo,
      filter: { codecs: ["avc", "h264"] },
    },
    {
      title: "HEVC/H.265",
      icon: FileVideo,
      filter: { codecs: ["hevc", "h265"] },
    },
    {
      title: "AV1",
      icon: FileVideo,
      filter: { codecs: ["av1"] },
    },
  ],
  advancedFeatures: [
    {
      title: "HDR10",
      icon: Sparkles,
      filter: { hdr: ["hdr10"] },
    },
    {
      title: "HLG",
      icon: Sparkles,
      filter: { hdr: ["hlg"] },
    },
    {
      title: "Dolby Vision",
      icon: Zap,
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
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Video className="size-4" />
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
        <div className="p-2">
          <div className="text-xs text-sidebar-foreground/70">
            <div>Dataset: v1.0.0</div>
            <div>Assets: Loading...</div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
