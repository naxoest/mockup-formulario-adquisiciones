import { MoreVertical } from 'lucide-react'
import { cn } from '@/utils/cn'
import { TableMenu, type TableMenuItem } from './TableMenu'
import type { Density, RowAction } from './DataTable.types'

interface TableActionsProps<T> {
  row: T
  actions: RowAction<T>[]
  maxVisibleActions?: number
  shouldShowActions?: (action: RowAction<T>, row: T) => boolean
  density?: Density
}

type DensityStyle = { iconSize: number; padding: string; fontSize: string }

const densityConfig: Record<Density, DensityStyle> = {
  compact: { iconSize: 14, padding: 'p-1.5', fontSize: 'text-xs' },
  normal: { iconSize: 18, padding: 'p-1.5', fontSize: 'text-xs' },
  comfortable: { iconSize: 20, padding: 'p-2', fontSize: 'text-base' },
}

export function TableActions<T>({
  row,
  actions,
  maxVisibleActions = 2,
  shouldShowActions,
  density = 'normal',
}: TableActionsProps<T>) {
  const config = densityConfig[density]

  const filteredActions = shouldShowActions
    ? actions.filter((action) => shouldShowActions(action, row))
    : actions

  const visibleActions = filteredActions.slice(0, maxVisibleActions)
  const hiddenActions = filteredActions.slice(maxVisibleActions)
  const hasOverflow = hiddenActions.length > 0

  if (filteredActions.length === 0) return null

  const menuItems: TableMenuItem[] = hiddenActions.map((action) => ({
    key: action.key,
    disabled: action.disabled?.(row),
    onSelect: () => action.onClick(row),
    content: (
      <>
        <span className={action.className}>{action.icon}</span>
        <span className="font-medium">{action.label}</span>
      </>
    ),
  }))

  return (
    <div className="flex items-center justify-end gap-1">
      {visibleActions.map((action) => (
        <button
          key={action.key}
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            action.onClick(row)
          }}
          disabled={action.disabled?.(row)}
          title={action.label}
          aria-label={action.label}
          className={cn(
            'rounded-lg transition-colors flex flex-col items-center justify-center',
            config.padding,
            action.className,
            action.hoverClassName ?? 'hover:bg-mercury-100',
            'disabled:opacity-50 disabled:cursor-not-allowed',
          )}
        >
          {action.icon}
          {density !== 'compact' && <span className={config.fontSize}>{action.label}</span>}
        </button>
      ))}

      {hasOverflow && (
        <div className="relative">
          <TableMenu
            label="Más opciones"
            triggerClassName={cn(
              'rounded-lg transition-colors flex flex-col items-center justify-center',
              config.padding,
              'text-mercury-500 hover:text-mercury-700 hover:bg-mercury-100',
            )}
            menuClassName="w-56"
            items={menuItems}
          >
            <MoreVertical size={config.iconSize} />
            {density !== 'compact' && <span className={config.fontSize}>Más</span>}
          </TableMenu>
        </div>
      )}
    </div>
  )
}
