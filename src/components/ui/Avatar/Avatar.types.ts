export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl'

export interface AvatarProps {
  initials: string
  seed: string | number
  src?: string
  loading?: 'eager' | 'lazy'
  size?: AvatarSize
  ariaLabel?: string
  className?: string
}
