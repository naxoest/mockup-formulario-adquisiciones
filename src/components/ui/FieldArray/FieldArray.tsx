import { useState } from 'react'
import { useFieldArray, useFormContext, useFormState, type FieldValues } from 'react-hook-form'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { DisclosureList, type DisclosureListItem } from '@/components/ui/DisclosureList'
import { cn } from '@/utils/cn'
import type { FieldArrayProps } from './FieldArray.types'

const UID_KEY = '_uid'

function resolveErrorNode(errors: unknown, name: string): unknown {
  return name.split('.').reduce<unknown>((acc, key) => {
    if (acc != null && typeof acc === 'object' && key in (acc as object)) {
      return (acc as Record<string, unknown>)[key]
    }
    return undefined
  }, errors)
}

function extractMessage(node: unknown): string | undefined {
  if (node == null || typeof node !== 'object') return undefined
  const n = node as { root?: { message?: unknown }; message?: unknown }
  const msg = n.root?.message ?? n.message
  return typeof msg === 'string' ? msg : undefined
}

function indexHasError(node: unknown, index: number): boolean {
  if (node == null || typeof node !== 'object') return false
  return (node as Record<string, unknown>)[index] != null
}

function itemUid(item: unknown, fallback: string): string {
  if (item != null && typeof item === 'object' && UID_KEY in item) {
    const uid = (item as Record<string, unknown>)[UID_KEY]
    if (typeof uid === 'string') return uid
  }
  return fallback
}

export const FieldArray = <TValues extends FieldValues = FieldValues>({
  name,
  defaultItem,
  description,
  renderSummary,
  renderDetail,
  max,
  addLabel = 'Agregar',
  emptyState = 'Aún no has agregado elementos.',
  itemLabel = (index: number) => `Elemento ${index + 1}`,
  canRemove,
  className,
}: FieldArrayProps<TValues>) => {
  const { control } = useFormContext<TValues>()
  const { fields, append, remove } = useFieldArray<TValues>({ control, name })
  const { errors } = useFormState<TValues>({ control })

  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set())

  const arrayNode = resolveErrorNode(errors, name)
  const arrayMessage = extractMessage(arrayNode)
  const atMax = typeof max === 'number' && fields.length >= max

  const items: DisclosureListItem[] = fields.map((field, index) => ({
    id: itemUid(field, field.id),
    hasError: indexHasError(arrayNode, index),
  }))

  const handleAdd = () => {
    const uid = crypto.randomUUID()
    append({ ...(defaultItem() as object), [UID_KEY]: uid } as Parameters<typeof append>[0])
    setOpenIds((prev) => {
      const next = new Set(prev)
      next.add(uid)
      return next
    })
  }

  const handleToggle = (uid: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev)
      if (next.has(uid)) next.delete(uid)
      else next.add(uid)
      return next
    })
  }

  const handleRemove = (index: number, uid: string) => {
    remove(index)
    setOpenIds((prev) => {
      if (!prev.has(uid)) return prev
      const next = new Set(prev)
      next.delete(uid)
      return next
    })
  }

  return (
    <div className={cn('space-y-3', className)}>
      <DisclosureList
        items={items}
        description={description}
        emptyState={emptyState}
        message={arrayMessage}
        openIds={openIds}
        onToggle={handleToggle}
        renderSummary={renderSummary}
        renderDetail={renderDetail}
        renderItemAction={({ index }) =>
          canRemove && !canRemove(index) ? null : (
            <button
              type="button"
              aria-label={`Eliminar ${itemLabel(index)}`}
              onClick={() => handleRemove(index, items[index].id)}
              className="flex shrink-0 items-center px-3 text-mercury-400 transition-colors hover:bg-scarlet-50 hover:text-scarlet-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-scarlet-500"
            >
              <Trash2 aria-hidden="true" className="size-4" />
            </button>
          )
        }
      />

      <div>
        <Button type="button" variant="secondary" onClick={handleAdd} disabled={atMax}>
          <Plus aria-hidden="true" className="size-4" />
          {addLabel}
        </Button>
      </div>
    </div>
  )
}
