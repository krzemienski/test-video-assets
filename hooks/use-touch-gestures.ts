"use client"

import * as React from "react"

interface TouchGestureOptions {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  onPinch?: (scale: number) => void
  onTap?: () => void
  onDoubleTap?: () => void
  threshold?: number
  preventScroll?: boolean
}

interface TouchPoint {
  x: number
  y: number
  timestamp: number
}

export function useTouchGestures(options: TouchGestureOptions) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onPinch,
    onTap,
    onDoubleTap,
    threshold = 50,
    preventScroll = false,
  } = options

  const touchStart = React.useRef<TouchPoint | null>(null)
  const touchEnd = React.useRef<TouchPoint | null>(null)
  const lastTap = React.useRef<number>(0)
  const initialDistance = React.useRef<number>(0)

  const getDistance = (touch1: React.Touch, touch2: React.Touch) => {
    const dx = touch1.clientX - touch2.clientX
    const dy = touch1.clientY - touch2.clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  const handleTouchStart = React.useCallback(
    (e: React.TouchEvent) => {
      if (preventScroll) {
        e.preventDefault()
      }

      const touch = e.touches[0]
      touchStart.current = {
        x: touch.clientX,
        y: touch.clientY,
        timestamp: Date.now(),
      }

      // Handle pinch gesture
      if (e.touches.length === 2 && onPinch) {
        initialDistance.current = getDistance(e.touches[0], e.touches[1])
      }
    },
    [preventScroll, onPinch],
  )

  const handleTouchMove = React.useCallback(
    (e: React.TouchEvent) => {
      if (preventScroll) {
        e.preventDefault()
      }

      // Handle pinch gesture
      if (e.touches.length === 2 && onPinch && initialDistance.current > 0) {
        const currentDistance = getDistance(e.touches[0], e.touches[1])
        const scale = currentDistance / initialDistance.current
        onPinch(scale)
      }
    },
    [preventScroll, onPinch],
  )

  const handleTouchEnd = React.useCallback(
    (e: React.TouchEvent) => {
      if (!touchStart.current) return

      const touch = e.changedTouches[0]
      touchEnd.current = {
        x: touch.clientX,
        y: touch.clientY,
        timestamp: Date.now(),
      }

      const deltaX = touchEnd.current.x - touchStart.current.x
      const deltaY = touchEnd.current.y - touchStart.current.y
      const deltaTime = touchEnd.current.timestamp - touchStart.current.timestamp

      const absX = Math.abs(deltaX)
      const absY = Math.abs(deltaY)

      // Check for tap gestures
      if (absX < 10 && absY < 10 && deltaTime < 300) {
        const now = Date.now()
        const timeSinceLastTap = now - lastTap.current

        if (timeSinceLastTap < 300 && onDoubleTap) {
          onDoubleTap()
          lastTap.current = 0
        } else {
          lastTap.current = now
          if (onTap) {
            setTimeout(() => {
              if (lastTap.current === now) {
                onTap()
              }
            }, 300)
          }
        }
        return
      }

      // Check for swipe gestures
      if (Math.max(absX, absY) > threshold) {
        if (absX > absY) {
          // Horizontal swipe
          if (deltaX > 0 && onSwipeRight) {
            onSwipeRight()
          } else if (deltaX < 0 && onSwipeLeft) {
            onSwipeLeft()
          }
        } else {
          // Vertical swipe
          if (deltaY > 0 && onSwipeDown) {
            onSwipeDown()
          } else if (deltaY < 0 && onSwipeUp) {
            onSwipeUp()
          }
        }
      }

      touchStart.current = null
      touchEnd.current = null
      initialDistance.current = 0
    },
    [threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onTap, onDoubleTap],
  )

  const gestureHandlers = React.useMemo(
    () => ({
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    }),
    [handleTouchStart, handleTouchMove, handleTouchEnd],
  )

  return gestureHandlers
}
