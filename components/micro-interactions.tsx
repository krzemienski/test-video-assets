"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AnimatedButtonProps extends React.ComponentProps<typeof Button> {
  animation?: "pulse" | "bounce" | "shake" | "glow" | "scale"
  trigger?: "hover" | "click" | "focus"
}

export function AnimatedButton({
  animation = "scale",
  trigger = "hover",
  className,
  children,
  ...props
}: AnimatedButtonProps) {
  const [isAnimating, setIsAnimating] = React.useState(false)

  const animationClasses = {
    pulse: "animate-pulse",
    bounce: "animate-bounce",
    shake: "animate-shake",
    glow: "animate-glow",
    scale: "transition-transform hover:scale-105 active:scale-95",
  }

  const handleInteraction = (event: React.MouseEvent | React.FocusEvent) => {
    if (trigger === "click" && event.type === "click") {
      setIsAnimating(true)
      setTimeout(() => setIsAnimating(false), 200)
    }
  }

  return (
    <Button
      className={cn(
        animationClasses[animation],
        isAnimating && animation !== "scale" && animationClasses[animation],
        className,
      )}
      onClick={handleInteraction}
      onFocus={trigger === "focus" ? handleInteraction : undefined}
      {...props}
    >
      {children}
    </Button>
  )
}

interface RippleEffectProps {
  children: React.ReactNode
  className?: string
}

export function RippleEffect({ children, className }: RippleEffectProps) {
  const [ripples, setRipples] = React.useState<Array<{ x: number; y: number; id: number }>>([])

  const addRipple = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const id = Date.now()

    setRipples((prev) => [...prev, { x, y, id }])

    setTimeout(() => {
      setRipples((prev) => prev.filter((ripple) => ripple.id !== id))
    }, 600)
  }

  return (
    <div className={cn("relative overflow-hidden", className)} onClick={addRipple}>
      {children}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute rounded-full bg-white/30 animate-ping"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
          }}
        />
      ))}
    </div>
  )
}
