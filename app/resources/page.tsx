"use client"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, Book, Wrench, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ResourcesPage() {
  const router = useRouter()

  const handleSidebarFilterChange = () => {
    // Resources page doesn't use filters, but we need this for sidebar compatibility
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <div className="hidden md:block">
          <AppSidebar onFilterChange={handleSidebarFilterChange} />
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center px-4">
              <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Assets
              </Button>
              <h1 className="text-lg font-semibold">Resources</h1>
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            <div className="container mx-auto p-6 space-y-8">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold">Resources</h1>
                <p className="text-muted-foreground">
                  Documentation, tools, and guides for video testing and streaming protocols.
                </p>
              </div>

              {/* Quick Start Guide */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="h-5 w-5" />
                    Quick Start Guide
                  </CardTitle>
                  <CardDescription>
                    Learn how to test video playback with different protocols and players.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <h4 className="font-semibold">HLS Testing</h4>
                      <p className="text-sm text-muted-foreground">
                        Use Safari, iOS devices, or HLS.js for testing HTTP Live Streaming content.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold">DASH Testing</h4>
                      <p className="text-sm text-muted-foreground">
                        Test MPEG-DASH streams with Chrome, Firefox, or dash.js players.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tools & Players */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5" />
                    Tools & Players
                  </CardTitle>
                  <CardDescription>Recommended tools and players for video testing and development.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-3">
                      <h4 className="font-semibold">Command Line Tools</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">ffplay</span>
                          <Badge variant="secondary">CLI</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">mpv</span>
                          <Badge variant="secondary">CLI</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold">Web Players</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Video.js</span>
                          <Badge variant="outline">Web</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Shaka Player</span>
                          <Badge variant="outline">Web</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">HLS.js</span>
                          <Badge variant="outline">Web</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold">Mobile SDKs</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">ExoPlayer</span>
                          <Badge variant="destructive">Android</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">AVPlayer</span>
                          <Badge variant="default">iOS</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Glossary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Book className="h-5 w-5" />
                    Glossary
                  </CardTitle>
                  <CardDescription>Key terms and concepts in video streaming and testing.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold">CMAF</h4>
                        <p className="text-sm text-muted-foreground">
                          Common Media Application Format - A standard for packaging media content for streaming.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold">CENC</h4>
                        <p className="text-sm text-muted-foreground">
                          Common Encryption - A standard for encrypting media content across different DRM systems.
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold">PQ vs HLG</h4>
                        <p className="text-sm text-muted-foreground">
                          Perceptual Quantizer vs Hybrid Log-Gamma - Two HDR transfer functions with different
                          characteristics.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold">Dolby Vision Profiles</h4>
                        <p className="text-sm text-muted-foreground">
                          Different implementation profiles (4, 5, 7, 8) for Dolby Vision HDR content delivery.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  )
}
