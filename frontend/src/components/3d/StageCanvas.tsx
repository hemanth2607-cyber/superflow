import React, { Suspense, useState, useEffect } from 'react'
import { FallbackStage } from '../2d/FallbackStage'

// Lazy-load the 3D chunk to keep initial bundle ultra-light
const LazyR3FStage = React.lazy(() => import('./R3FStage'))

export const StageCanvas: React.FC = () => {
  const [useFallback, setUseFallback] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)

    // 1. Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      setUseFallback(true)
      return
    }

    // 2. Check WebGL support
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      if (!gl) {
        setUseFallback(true)
      }
    } catch {
      setUseFallback(true)
    }
  }, [])

  if (!isClient || useFallback) {
    return <FallbackStage />
  }

  return (
    <div className="relative w-full h-80 md:h-96">
      <Suspense fallback={<FallbackStage />}>
        <LazyR3FStage />
      </Suspense>
    </div>
  )
}
