import { useState } from 'react'
import { cn } from '@/utils/cn'
import type { AvatarProps, AvatarSize } from './Avatar.types'

const tones = [
  'bg-primary-100 text-primary-800',
  'bg-abyss-100 text-abyss-900',
  'bg-plum-100 text-plum-800',
  'bg-ember-100 text-ember-800',
  'bg-jade-100 text-jade-800',
  'bg-saffron-100 text-saffron-800',
  'bg-crimson-100 text-crimson-800',
] as const

const sizeClasses: Record<AvatarSize, string> = {
  sm: 'size-7 text-xs',
  md: 'size-9 text-sm',
  lg: 'size-11 text-base',
  xl: 'size-14 text-lg',
  '2xl': 'size-24 text-3xl',
}

function toneIndex(seed: string | number): number {
  if (typeof seed === 'number') {
    if (!Number.isFinite(seed)) return 0
    return Math.abs(Math.trunc(seed)) % tones.length
  }

  let accumulated = 0
  for (let position = 0; position < seed.length; position += 1) {
    accumulated = (accumulated * 31 + seed.charCodeAt(position)) % tones.length
  }
  return accumulated
}

export function Avatar({
  initials,
  seed,
  src,
  loading,
  size = 'md',
  ariaLabel,
  className,
}: AvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string | undefined>(undefined)
  const showImage = src !== undefined && src !== '' && src !== failedSrc

  if (showImage) {
    return (
      <img
        src={src}
        alt={ariaLabel ?? ''}
        loading={loading}
        onError={() => setFailedSrc(src)}
        className={cn(
          'inline-block shrink-0 rounded-full object-cover',
          sizeClasses[size],
          className,
        )}
      />
    )
  }

  return (
    <span
      role={ariaLabel ? 'img' : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-semibold select-none',
        tones[toneIndex(seed)],
        sizeClasses[size],
        className,
      )}
    >
      {initials.trim().slice(0, 2).toUpperCase()}
    </span>
  )
}
