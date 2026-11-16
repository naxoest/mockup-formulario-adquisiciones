import { useId, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { DisclosureListProps } from './DisclosureList.types'

export const DisclosureList = ({
  items,
  renderSummary,
  renderDetail,
  renderItemAction,
  openIds,
  onToggle,
  description,
  emptyState = 'No hay elementos.',
  message,
  className,
}: DisclosureListProps) => {
  const baseId = useId()
  const descriptionId = `${baseId}-description`
  const [internalOpenIds, setInternalOpenIds] = useState<Set<string>>(() => new Set())

  const isControlled = openIds !== undefined
  const resolvedOpenIds = isControlled ? openIds : internalOpenIds

  const handleToggle = (id: string) => {
    if (!isControlled) {
      setInternalOpenIds((prev) => {
        const next = new Set(prev)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        return next
      })
    }
    onToggle?.(id)
  }

  return (
    <div
      role="group"
      aria-describedby={description ? descriptionId : undefined}
      className={cn('space-y-3', className)}
    >
      {description && (
        <p id={descriptionId} className="text-xs text-mercury-500">
          {description}
        </p>
      )}
      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-mercury-300 px-4 py-8 text-center text-sm text-mercury-500">
          {emptyState}
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => {
            const isOpen = resolvedOpenIds.has(item.id)
            const hasError = item.hasError ?? false
            const state = { index, isOpen, hasError }
            const contentId = `${baseId}-${item.id}`
            return (
              <div
                key={item.id}
                className={cn(
                  'overflow-hidden rounded-lg border bg-white',
                  hasError ? 'border-scarlet-300' : 'border-mercury-300',
                )}
              >
                <div
                  className={cn(
                    'flex items-stretch',
                    isOpen && (hasError ? 'bg-scarlet-50' : 'bg-mercury-50'),
                  )}
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={contentId}
                    onClick={() => handleToggle(item.id)}
                    className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-mercury-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500"
                  >
                    <ChevronDown
                      aria-hidden="true"
                      className={cn(
                        'size-4 shrink-0 text-mercury-400 transition-transform duration-200',
                        isOpen && 'rotate-180 text-mercury-700',
                      )}
                    />
                    <span className="min-w-0 flex-1">{renderSummary(state)}</span>
                  </button>
                  {renderItemAction?.(state)}
                </div>
                <div
                  className={cn(
                    'grid transition-[grid-template-rows] duration-200 ease-out',
                    isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                  )}
                >
                  <div className="min-h-0 overflow-hidden">
                    <div
                      id={contentId}
                      inert={!isOpen}
                      className={cn(
                        'border-t px-4 py-4',
                        hasError ? 'border-scarlet-200' : 'border-mercury-200',
                      )}
                    >
                      {renderDetail(state)}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {message && (
        <p role="alert" className="text-xs text-scarlet-600">
          {message}
        </p>
      )}
    </div>
  )
}
