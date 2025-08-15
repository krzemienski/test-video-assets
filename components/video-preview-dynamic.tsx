"use client"

import dynamic from 'next/dynamic'
import { Skeleton } from "@/components/ui/skeleton"
import type { Asset } from "@/lib/types"

// Loading component while video player loads
function VideoLoading() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-muted rounded-lg">
      <Skeleton className="w-full h-[400px]" />
    </div>
  )
}

// Dynamically import heavy video component
const VideoPreview = dynamic(
  () => import('./video-preview').then(mod => ({ default: mod.VideoPreview })),
  {
    loading: () => <VideoLoading />,
    ssr: false // Disable SSR for video player
  }
)

interface VideoPreviewDynamicProps {
  asset: Asset
  autoplay?: boolean
  className?: string
}

export function VideoPreviewDynamic(props: VideoPreviewDynamicProps) {
  return <VideoPreview {...props} />
}