import { useEffect, useId, useState } from 'react'
import { ErrorCode, useDropzone, type FileError, type FileRejection } from 'react-dropzone'
import {
  AlertCircle,
  File as FileIcon,
  FileText,
  Image as ImageIcon,
  Info,
  Music,
  Paperclip,
  Smartphone,
  Trash2,
  Upload,
  Video,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { useFieldContext } from '@/components/ui/Form'
import type {
  FileCategory,
  FileRejectionMessage,
  FileUploadItem,
  FileUploadProps,
} from './FileUpload.types'
import {
  ALL_CATEGORIES,
  DEFAULT_MAX_FILES,
  FILE_CATEGORIES,
  MAX_TOTAL_UPLOAD_SIZE,
  buildAcceptAttribute,
  describeItem,
  formatBytes,
  getCategoryExtensions,
  getExtension,
  getFileCategory,
  getItemKey,
  isIPhoneFile,
  planAddition,
  validateFile,
} from './FileUpload.utils'

const CATEGORY_ICONS: Record<FileCategory, LucideIcon> = {
  image: ImageIcon,
  document: FileText,
  video: Video,
  audio: Music,
}

const EMPTY_ITEMS: FileUploadItem[] = []

const USAGE_WARNING_RATIO = 0.9

function toRejectionMessages(rejections: readonly FileRejection[]): FileRejectionMessage[] {
  return rejections.map((rejection) => ({
    name: rejection.file.name,
    message: rejection.errors.map((error) => error.message).join(', '),
  }))
}

export const FileUpload = ({
  value: valueProp,
  onChange: onChangeProp,
  onBlur: onBlurProp,
  categories = ALL_CATEGORIES,
  extensions,
  maxFiles = DEFAULT_MAX_FILES,
  maxTotalSize = MAX_TOTAL_UPLOAD_SIZE,
  disabled,
  invalid,
  id: idProp,
  className,
}: FileUploadProps) => {
  const ctx = useFieldContext()
  const reactId = useId()
  const [rejections, setRejections] = useState<FileRejectionMessage[]>([])

  const field = ctx?.field
  const rawValue: unknown = ctx ? ctx.field.value : valueProp
  const items = Array.isArray(rawValue) ? (rawValue as FileUploadItem[]) : EMPTY_ITEMS

  const inputId = ctx?.id ?? idProp ?? reactId
  const limitsId = `${inputId}-limits`
  const rejectionsId = `${inputId}-rejections`
  const listLabelId = `${inputId}-list`
  const usageLabelId = `${inputId}-usage`
  const usageDescriptionId = `${inputId}-usage-description`

  const isDisabled = Boolean(ctx?.field.disabled ?? disabled)
  const hasError = ctx?.fieldState.invalid ?? false
  const showInvalid = invalid ?? hasError
  const isAtCapacity = items.length >= maxFiles
  const isInactive = isDisabled || isAtCapacity

  const totalSize = items.reduce((sum, item) => sum + describeItem(item).size, 0)
  const warningThreshold = maxTotalSize * USAGE_WARNING_RATIO
  const usageText = `${formatBytes(totalSize)} de ${formatBytes(maxTotalSize)} utilizados`
  const visibleCategories = ALL_CATEGORIES.filter((category) => categories.includes(category))
    .map((category) => ({
      category,
      categoryExtensions: getCategoryExtensions(category, extensions),
    }))
    .filter(({ categoryExtensions }) => categoryExtensions.length > 0)

  const commit = (next: FileUploadItem[]) => {
    if (ctx) {
      ctx.field.onChange(next)
    } else {
      onChangeProp?.(next)
    }
  }

  const handleBlur = () => {
    if (ctx) {
      ctx.field.onBlur()
    } else {
      onBlurProp?.()
    }
  }

  const handleDrop = (accepted: File[], fileRejections: FileRejection[]) => {
    const plan = planAddition(items, accepted, { maxFiles, maxTotalSize })

    if (plan.accepted.length > 0) {
      commit([
        ...items,
        ...plan.accepted.map((file): FileUploadItem => ({ kind: 'pending', file })),
      ])
    }

    setRejections([...toRejectionMessages(fileRejections), ...plan.rejections])
  }

  const validator = (file: File): FileError | null => {
    const message = validateFile(file, categories, extensions)
    return message === null ? null : { code: 'file-rejected', message }
  }

  const getErrorMessage = (error: FileError): string =>
    error.code === ErrorCode.TooManyFiles ? `Máximo ${maxFiles} archivo(s)` : error.message

  const { getRootProps, getInputProps, inputRef, isDragActive } = useDropzone({
    onDrop: handleDrop,
    validator,
    getErrorMessage,
    multiple: maxFiles > 1,
    disabled: isInactive,
    noKeyboard: true,
  })

  useEffect(() => {
    field?.ref(inputRef.current)
  }, [field, inputRef])

  const removeItem = (key: string) => {
    commit(items.filter((item) => getItemKey(item) !== key))
    setRejections([])
  }

  const describedBy = [
    hasError ? ctx?.errorId : undefined,
    ctx?.hasDescription ? ctx.descriptionId : undefined,
    limitsId,
    rejections.length > 0 ? rejectionsId : undefined,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={cn('w-full space-y-6', className)}>
      <div
        {...getRootProps({
          className: cn(
            'group relative flex h-48 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 ease-out focus-within:ring-2 focus-within:ring-primary-100',
            isDragActive
              ? 'scale-[0.99] border-primary-500 bg-primary-50/50'
              : showInvalid
                ? 'border-scarlet-400 bg-mercury-50 hover:bg-white'
                : 'border-mercury-300 bg-mercury-50 hover:border-primary-400 hover:bg-white hover:shadow-sm',
            isInactive && 'pointer-events-none cursor-not-allowed opacity-60',
          ),
        })}
      >
        <input
          {...getInputProps({
            id: inputId,
            accept: buildAcceptAttribute(categories, extensions),
            tabIndex: 0,
            style: undefined,
            'aria-label': undefined,
            'aria-invalid': showInvalid || undefined,
            'aria-required': ctx?.required || undefined,
            'aria-describedby': describedBy,
            disabled: isInactive,
            onBlur: handleBlur,
            className: 'm-0 block h-0 w-0 overflow-hidden border-0 p-0 opacity-0',
          })}
        />

        <div className="relative z-10 px-4 text-center transition-transform duration-300 group-hover:-translate-y-1">
          <div
            className={cn(
              'mx-auto mb-4 flex size-16 items-center justify-center rounded-full transition-colors',
              isDragActive
                ? 'bg-primary-100 text-primary-600'
                : 'bg-white text-mercury-400 shadow-sm group-hover:text-primary-500',
            )}
          >
            <Upload size={28} strokeWidth={2} aria-hidden="true" />
          </div>
          <p className="mb-1 text-lg font-bold text-mercury-700">
            {isAtCapacity
              ? 'Se alcanzó el máximo de archivos'
              : isDragActive
                ? 'Suelte los archivos ahora'
                : 'Haga clic o arrastre archivos'}
          </p>
          <p id={limitsId} className="text-sm text-mercury-500">
            Máximo {maxFiles} archivo(s) - Total hasta {formatBytes(maxTotalSize)}
          </p>
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--color-mercury-100)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-mercury-100)_1px,transparent_1px)] bg-size-[32px_32px] [mask-image:linear-gradient(to_top,var(--color-mercury-50),color-mix(in_srgb,var(--color-mercury-50)_60%,transparent))]"
        />
      </div>

      <div className="w-full space-y-3">
        <div className="flex items-center gap-2 text-mercury-600">
          <Info size={14} className="shrink-0" aria-hidden="true" />
          <p className="text-sm font-semibold">Formatos aceptados</p>
        </div>

        <ul className="flex w-full flex-wrap justify-center gap-3">
          {visibleCategories.map(({ category, categoryExtensions }) => {
            const definition = FILE_CATEGORIES[category]
            const Icon = CATEGORY_ICONS[category]
            return (
              <li
                key={category}
                className="flex min-w-[180px] max-w-[260px] flex-1 flex-col gap-2 rounded-xl border border-mercury-200 bg-mercury-50 px-3 py-2.5"
              >
                <div className="flex items-center gap-2 text-mercury-600">
                  <Icon size={14} className="shrink-0" aria-hidden="true" />
                  <span className="text-xs font-semibold">{definition.label}</span>
                  <span className="ml-auto text-[11px] text-mercury-400">
                    hasta {formatBytes(definition.maxSize)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {categoryExtensions.map((extension) => (
                    <span
                      key={extension}
                      className="rounded border border-mercury-200 bg-white px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-mercury-500"
                    >
                      {extension.slice(1)}
                    </span>
                  ))}
                </div>
                {extensions === undefined && (
                  <p className="text-[10px] leading-snug text-mercury-400">{definition.note}</p>
                )}
              </li>
            )
          })}
        </ul>
      </div>

      {rejections.length > 0 && (
        <div
          id={rejectionsId}
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-scarlet-200 bg-scarlet-50 p-4"
        >
          <AlertCircle className="mt-0.5 shrink-0 text-scarlet-600" size={18} aria-hidden="true" />
          <div className="text-sm">
            <p className="mb-1 font-bold text-scarlet-800">
              No se pudieron agregar algunos archivos
            </p>
            <ul className="list-inside list-disc space-y-0.5 text-scarlet-700">
              {rejections.map((rejection, index) => (
                <li key={`${rejection.name}-${index}`}>
                  {rejection.name}: {rejection.message}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {items.length > 0 && (
        <div className="space-y-4">
          <p
            id={listLabelId}
            className="flex items-center gap-2 px-1 text-sm font-bold text-mercury-700"
          >
            <Paperclip size={16} aria-hidden="true" />
            Archivos adjuntos
            <span className="font-normal text-mercury-400">
              ({items.length}/{maxFiles})
            </span>
          </p>

          <ul aria-labelledby={listLabelId} className="grid gap-3">
            {items.map((item) => {
              const key = getItemKey(item)
              const descriptor = describeItem(item)
              const category = getFileCategory(descriptor)
              const Icon = category ? CATEGORY_ICONS[category] : FileIcon
              const fromIPhone = isIPhoneFile(descriptor)
              const extension = getExtension(descriptor.name).slice(1) || '?'

              return (
                <li
                  key={key}
                  className="relative w-full max-w-full overflow-hidden rounded-xl border border-mercury-200 bg-white p-3 shadow-sm transition-all hover:border-primary-300 hover:shadow-md"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        'flex size-10 shrink-0 items-center justify-center rounded-lg',
                        fromIPhone
                          ? 'bg-mercury-900 text-white'
                          : 'bg-mercury-100 text-mercury-500',
                      )}
                    >
                      {fromIPhone ? (
                        <Smartphone size={18} aria-hidden="true" />
                      ) : (
                        <Icon size={20} aria-hidden="true" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold text-mercury-700">
                          {descriptor.name}
                        </p>
                        {fromIPhone && (
                          <span className="rounded border border-mercury-200 bg-mercury-100 px-1.5 py-0.5 text-[10px] font-bold text-mercury-600">
                            HEIC/MOV
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 flex items-center gap-2 text-xs text-mercury-400">
                        {formatBytes(descriptor.size)}
                        <span aria-hidden="true" className="size-1 rounded-full bg-mercury-300" />
                        <span className="uppercase">{extension}</span>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(key)}
                      disabled={isDisabled}
                      aria-label={`Eliminar ${descriptor.name}`}
                      title="Eliminar archivo"
                      className="cursor-pointer rounded-lg p-2 text-scarlet-400 transition-colors hover:bg-scarlet-50 hover:text-scarlet-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Trash2 size={18} aria-hidden="true" />
                    </button>
                  </div>

                  {fromIPhone && (
                    <div className="mt-2 flex items-start gap-1.5 rounded bg-saffron-50 px-2 py-1 text-[11px] text-saffron-700">
                      <Info size={12} className="mt-0.5 shrink-0" aria-hidden="true" />
                      <span>
                        Formato de Apple detectado. Se recomienda subir mediante dispositivos iPhone
                        o Mac usando el navegador Safari.
                      </span>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-mercury-600">
              <Info size={14} className="shrink-0" aria-hidden="true" />
              <p id={usageLabelId} className="text-sm font-semibold">
                Espacio utilizado para adjuntos
              </p>
            </div>
            <p id={usageDescriptionId} className="text-xs text-mercury-500">
              Muestra cuánto del límite total ya está ocupado.
            </p>
            <meter
              aria-labelledby={usageLabelId}
              aria-describedby={usageDescriptionId}
              aria-valuetext={usageText}
              min={0}
              max={maxTotalSize}
              low={warningThreshold}
              high={warningThreshold}
              optimum={0}
              value={Math.min(totalSize, maxTotalSize)}
              className="block h-2 w-full"
            />
            <p className="text-xs text-mercury-500">{usageText}</p>
          </div>
        </div>
      )}
    </div>
  )
}
