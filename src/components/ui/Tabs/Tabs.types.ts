import type { ReactNode } from 'react'

export interface TabItem<TKey extends string = string> {
  key: TKey
  label: string
  icon?: ReactNode
  content: ReactNode
}

export interface TabsProps<TKey extends string = string> {
  items: TabItem<TKey>[]
  value: TKey
  onChange: (key: TKey) => void
  ariaLabel: string
  className?: string
}
