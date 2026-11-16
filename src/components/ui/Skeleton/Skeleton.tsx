import type { CSSProperties } from 'react'
import { cn } from '@/utils/cn'

type SkeletonRounded = 'none' | 'sm' | 'md' | 'lg' | 'full'

interface SkeletonProps {
  width?: number | string
  height?: number | string
  rounded?: SkeletonRounded
  className?: string
}

const roundedClasses: Record<SkeletonRounded, string> = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
}

export function Skeleton({
  width = '100%',
  height = '1em',
  rounded = 'md',
  className,
}: SkeletonProps) {
  const style: CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  }

  return (
    <span
      aria-hidden="true"
      style={style}
      className={cn(
        'inline-block bg-gradient-to-r from-mercury-100 via-mercury-200 to-mercury-100 bg-[length:200%_100%] animate-shimmer',
        roundedClasses[rounded],
        className,
      )}
    />
  )
}
