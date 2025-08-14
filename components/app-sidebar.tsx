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

// Navigation data based on PRD requirements
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
      url: "/protocols/hls",
      icon: Play,
    },
    {
      title: "DASH",
      url: "/protocols/dash",
      icon: Video,
    },
    {
      title: "CMAF",
      url: "/protocols/cmaf",
      icon: Database,
    },
    {
      title: "Smooth Streaming",
      url: "/protocols/smooth",
      icon: Gauge,
    },
  ],
  videoSpecs: [
    {
      title: "4K Assets",
      url: "/specs/4k",
      icon: Monitor,
    },
    {
      title: "8K Assets",
      url: "/specs/8k",
      icon: Monitor,
    },
    {
      title: "H.264/AVC",
      url: "/codecs/avc",
      icon: FileVideo,
    },
    {
      title: "HEVC/H.265",
      url: "/codecs/hevc",
      icon: FileVideo,
    },
    {
      title: "AV1",
      url: "/codecs/av1",
      icon: FileVideo,
    },
  ],
  advancedFeatures: [
    {
      title: "HDR10",
      url: "/hdr/hdr10",
      icon: Sparkles,
    },
    {
      title: "HLG",
      url: "/hdr/hlg",
      icon: Sparkles,
    },
    {
      title: "Dolby Vision",
      url: "/hdr/dovi",
      icon: Zap,
    },
  ],
  resources: [
    {
      title: "Documentation",
      url: "/resources/docs",
      icon: Settings,
    },
    {
      title: "Tools & Players",
      url: "/resources/tools",
      icon: Settings,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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

        <SidebarSeparator />

        {/* Streaming Protocols */}
        <SidebarGroup>
          <SidebarGroupLabel>Streaming Protocols</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationData.protocols.map((item) => (
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

        {/* Video Specifications */}
        <SidebarGroup>
          <SidebarGroupLabel>Video Specs</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationData.videoSpecs.map((item) => (
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

        {/* Advanced Features */}
        <SidebarGroup>
          <SidebarGroupLabel>Advanced Features</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationData.advancedFeatures.map((item) => (
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
