/**
 * Image optimization utilities for Next.js Image component
 */

export const imageLoader = ({ src, width, quality }: {
  src: string
  width: number
  quality?: number
}) => {
  // For external images, return as-is
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return src
  }
  
  // For local images, use Next.js optimization
  const params = new URLSearchParams()
  params.set('url', src)
  params.set('w', width.toString())
  params.set('q', (quality || 75).toString())
  
  return `/_next/image?${params.toString()}`
}

export const getImageDimensions = (aspectRatio: string = '16:9'): {
  width: number
  height: number
} => {
  const [widthRatio, heightRatio] = aspectRatio.split(':').map(Number)
  const baseWidth = 1920
  
  return {
    width: baseWidth,
    height: Math.round((baseWidth * heightRatio) / widthRatio)
  }
}

export const getResponsiveSizes = () => {
  return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
}

export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = reject
    img.src = src
  })
}

export const lazyLoadOptions = {
  root: null,
  rootMargin: '50px',
  threshold: 0.01
}