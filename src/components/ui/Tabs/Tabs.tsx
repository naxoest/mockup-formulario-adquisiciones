import { useId, type KeyboardEvent } from 'react'
import { cn } from '@/utils/cn'
import type { TabsProps } from './Tabs.types'

function nextTabIndex(key: string, index: number, total: number): number | null {
  switch (key) {
    case 'ArrowRight':
      return (index + 1) % total
    case 'ArrowLeft':
      return (index - 1 + total) % total
    case 'Home':
      return 0
    case 'End':
      return total - 1
    default:
      return null
  }
}

export const Tabs = <TKey extends string>({
  items,
  value,
  onChange,
  ariaLabel,
  className,
}: TabsProps<TKey>) => {
  const baseId = useId()
  const activeItem = items.find((item) => item.key === value)

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const nextIndex = nextTabIndex(event.key, index, items.length)

    if (nextIndex === null) return

    event.preventDefault()
    event.currentTarget.parentElement
      ?.querySelectorAll<HTMLElement>('[role="tab"]')
      .item(nextIndex)
      .focus()
    onChange(items[nextIndex].key)
  }

  return (
    <div className={className}>
      <div
        role="tablist"
        aria-label={ariaLabel}
        className="flex flex-wrap gap-1 border-b border-mercury-200"
      >
        {items.map((item, index) => {
          const selected = item.key === value

          return (
            <button
              key={item.key}
              type="button"
              role="tab"
              id={`${baseId}-tab-${item.key}`}
              aria-selected={selected}
              aria-controls={selected ? `${baseId}-panel-${item.key}` : undefined}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(item.key)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className={cn(
                '-mb-px inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-100',
                selected
                  ? 'border-primary-500 text-primary-700'
                  : 'border-transparent text-mercury-600 hover:border-mercury-300 hover:text-mercury-900',
              )}
            >
              {item.icon}
              {item.label}
            </button>
          )
        })}
      </div>
      {activeItem && (
        <div
          role="tabpanel"
          id={`${baseId}-panel-${activeItem.key}`}
          aria-labelledby={`${baseId}-tab-${activeItem.key}`}
          tabIndex={0}
          className="mt-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-100"
        >
          {activeItem.content}
        </div>
      )}
    </div>
  )
}
