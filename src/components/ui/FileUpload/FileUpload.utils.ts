import { z } from 'zod'
import type {
  FileAdditionPlan,
  FileCategory,
  FileCategoryDefinition,
  FileDescriptor,
  FileExtension,
  FileUploadItem,
  FileUploadLimits,
} from './FileUpload.types'

export const MAX_TOTAL_UPLOAD_SIZE = 175 * 1024 * 1024
export const DEFAULT_MAX_FILES = 5
export const MAX_FILENAME_LENGTH = 200

export const FILE_CATEGORIES: Record<FileCategory, FileCategoryDefinition> = {
  image: {
    label: 'Imágenes',
    note: 'Fotos e imágenes. Incluye los formatos HEIC/HEIF que usan los iPhone.',
    maxSize: 10 * 1024 * 1024,
    formats: [
      { mimes: ['image/jpeg'], extensions: ['.jpg', '.jpeg'] },
      { mimes: ['image/png'], extensions: ['.png'] },
      { mimes: ['image/gif'], extensions: ['.gif'] },
      { mimes: ['image/webp'], extensions: ['.webp'] },
      { mimes: ['image/heic', 'image/heif'], extensions: ['.heic'] },
      { mimes: ['image/heif'], extensions: ['.heif'] },
      { mimes: ['image/avif'], extensions: ['.avif'] },
    ],
  },
  document: {
    label: 'Documentos',
    note: 'Archivos PDF y documentos de Word, Excel y archivos de texto.',
    maxSize: 25 * 1024 * 1024,
    formats: [
      { mimes: ['application/pdf'], extensions: ['.pdf'] },
      { mimes: ['application/msword'], extensions: ['.doc'] },
      {
        mimes: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        extensions: ['.docx'],
      },
      { mimes: ['application/vnd.ms-excel'], extensions: ['.xls'] },
      {
        mimes: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
        extensions: ['.xlsx'],
      },
      { mimes: ['text/plain'], extensions: ['.txt'] },
      { mimes: ['text/csv'], extensions: ['.csv'] },
    ],
  },
  video: {
    label: 'Videos',
    note: 'Archivos de video.',
    maxSize: 100 * 1024 * 1024,
    formats: [
      { mimes: ['video/mp4'], extensions: ['.mp4', '.m4v'] },
      { mimes: ['video/quicktime'], extensions: ['.mov'] },
      {
        mimes: ['video/x-msvideo', 'video/avi', 'video/msvideo', 'video/vnd.avi'],
        extensions: ['.avi'],
      },
      { mimes: ['video/3gpp'], extensions: ['.3gp'] },
      { mimes: ['video/webm'], extensions: ['.webm'] },
      { mimes: ['video/x-matroska', 'video/matroska'], extensions: ['.mkv'] },
    ],
  },
  audio: {
    label: 'Audio',
    note: 'Grabaciones de sonido, notas de voz y música. Incluye los formatos usados por los audios de WhatsApp.',
    maxSize: 50 * 1024 * 1024,
    formats: [
      { mimes: ['audio/mpeg'], extensions: ['.mp3'] },
      { mimes: ['audio/wav', 'audio/x-wav', 'audio/wave'], extensions: ['.wav'] },
      { mimes: ['audio/ogg', 'audio/opus'], extensions: ['.opus', '.ogg'] },
      { mimes: ['audio/mp4', 'audio/x-m4a'], extensions: ['.m4a'] },
      { mimes: ['audio/aac', 'audio/vnd.dlna.adts'], extensions: ['.aac'] },
      { mimes: ['audio/flac'], extensions: ['.flac'] },
    ],
  },
}

export const ALL_CATEGORIES: readonly FileCategory[] = ['image', 'document', 'video', 'audio']

const WINDOWS_RESERVED_NAMES = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(\..*)?$/i
const FORBIDDEN_NAME_CHARS = /[:*?"<>|]/
const CONTROL_CHARS = /\p{Cc}/u
const INVISIBLE_CHARS = /[\p{Cf}\p{Zl}\p{Zp}]/u
const PATH_SEPARATORS = /[/\\]/
const PARENT_DIR_PATTERNS = [/^\.\.?$/, /\.\.[/\\]/]
const TRAILING_DOT_OR_SPACE = /[. ]$/
const UNRELIABLE_MIME_TYPES = new Set(['', 'application/octet-stream'])
const BYTE_UNITS = ['Bytes', 'KB', 'MB', 'GB', 'TB'] as const
const byteFormatter = new Intl.NumberFormat('es-CL', { maximumFractionDigits: 2 })

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 Bytes'
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), BYTE_UNITS.length - 1)
  return `${byteFormatter.format(bytes / 1024 ** exponent)} ${BYTE_UNITS[exponent]}`
}

export function getExtension(name: string): string {
  const index = name.lastIndexOf('.')
  if (index <= 0) return ''
  return name.slice(index).toLowerCase()
}

export function getFileCategory({
  name,
  type,
}: Pick<FileDescriptor, 'name' | 'type'>): FileCategory | null {
  const extension = getExtension(name)
  if (!extension) return null

  const mime = type.toLowerCase().trim()
  const mimeIsUnreliable = UNRELIABLE_MIME_TYPES.has(mime)

  for (const category of ALL_CATEGORIES) {
    const matches = FILE_CATEGORIES[category].formats.some(
      (format) =>
        format.extensions.includes(extension) && (mimeIsUnreliable || format.mimes.includes(mime)),
    )
    if (matches) return category
  }

  return null
}

export function isIPhoneFile({ name, type }: Pick<FileDescriptor, 'name' | 'type'>): boolean {
  const mime = type.toLowerCase()
  const extension = getExtension(name)
  if (mime === 'image/heic' || mime === 'image/heif') return true
  if (extension === '.heic' || extension === '.heif') return true
  return mime === 'video/quicktime' || extension === '.mov'
}

function isExtensionAllowed(extension: string, extensions?: readonly FileExtension[]): boolean {
  return (
    extensions === undefined ||
    extensions.some((allowed) => allowed.toLowerCase() === extension.toLowerCase())
  )
}

export function getCategoryExtensions(
  category: FileCategory,
  extensions?: readonly FileExtension[],
): string[] {
  return [
    ...new Set(FILE_CATEGORIES[category].formats.flatMap((format) => format.extensions)),
  ].filter((extension) => isExtensionAllowed(extension, extensions))
}

export function buildAcceptAttribute(
  categories: readonly FileCategory[],
  extensions?: readonly FileExtension[],
): string {
  const tokens = new Set<string>()
  for (const category of categories) {
    for (const format of FILE_CATEGORIES[category].formats) {
      const allowed = format.extensions.filter((extension) =>
        isExtensionAllowed(extension, extensions),
      )
      if (allowed.length === format.extensions.length) {
        format.mimes.forEach((mime) => tokens.add(mime))
      }
      allowed.forEach((extension) => tokens.add(extension))
    }
  }
  return [...tokens].join(',')
}

export function describeItem(item: FileUploadItem): FileDescriptor {
  if (item.kind === 'pending') {
    return { name: item.file.name, size: item.file.size, type: item.file.type }
  }
  return { name: item.name, size: item.size, type: item.type }
}

export function fileFingerprint(file: File): string {
  return `${file.name}::${file.size}::${file.lastModified}`
}

export function getItemKey(item: FileUploadItem): string {
  return item.kind === 'stored' ? `stored:${item.id}` : `pending:${fileFingerprint(item.file)}`
}

export function validateFileName(name: string, maxLength = MAX_FILENAME_LENGTH): string | null {
  if (!name) return 'nombre de archivo inválido'

  const trimmed = name.trim()

  if (trimmed.length === 0) return 'el nombre del archivo está vacío'
  if (trimmed.length > maxLength) return `el nombre del archivo excede ${maxLength} caracteres`
  if (CONTROL_CHARS.test(trimmed)) {
    return 'el nombre del archivo contiene caracteres de control no permitidos'
  }
  if (INVISIBLE_CHARS.test(trimmed)) {
    return 'el nombre del archivo contiene caracteres invisibles no permitidos'
  }
  if (PATH_SEPARATORS.test(trimmed)) {
    return 'el nombre del archivo no puede contener separadores de ruta'
  }
  if (FORBIDDEN_NAME_CHARS.test(trimmed)) {
    return 'el nombre del archivo contiene caracteres no permitidos'
  }
  if (PARENT_DIR_PATTERNS.some((pattern) => pattern.test(trimmed))) {
    return 'el nombre del archivo contiene una ruta no permitida'
  }
  if (TRAILING_DOT_OR_SPACE.test(trimmed)) {
    return 'el nombre del archivo no puede terminar en punto o espacio'
  }
  if (WINDOWS_RESERVED_NAMES.test(trimmed)) {
    return 'el nombre del archivo es un nombre reservado del sistema'
  }

  return null
}

export function validateFile(
  file: File,
  categories: readonly FileCategory[],
  extensions?: readonly FileExtension[],
): string | null {
  const nameError = validateFileName(file.name)
  if (nameError !== null) return nameError

  if (file.size <= 0) return 'el archivo está vacío (0 bytes)'

  const category = getFileCategory(file)
  if (category === null) return 'tipo de archivo no reconocido o inconsistente con su extensión'
  if (!categories.includes(category)) return 'tipo de archivo no permitido en este formulario'
  if (!isExtensionAllowed(getExtension(file.name), extensions)) {
    return 'tipo de archivo no permitido en este formulario'
  }

  const definition = FILE_CATEGORIES[category]
  if (file.size > definition.maxSize) {
    return `excede el límite de ${formatBytes(definition.maxSize)} para ${definition.label.toLowerCase()}`
  }

  return null
}

export function planAddition(
  current: readonly FileUploadItem[],
  incoming: readonly File[],
  { maxFiles, maxTotalSize }: FileUploadLimits,
): FileAdditionPlan {
  const seen = new Set(
    current.flatMap((item) => (item.kind === 'pending' ? [fileFingerprint(item.file)] : [])),
  )
  const accepted: File[] = []
  const rejections: FileAdditionPlan['rejections'] = []
  let count = current.length
  let total = current.reduce((sum, item) => sum + describeItem(item).size, 0)

  for (const file of incoming) {
    const fingerprint = fileFingerprint(file)

    if (seen.has(fingerprint)) {
      rejections.push({ name: file.name, message: 'Archivo duplicado' })
      continue
    }
    seen.add(fingerprint)

    if (count >= maxFiles) {
      rejections.push({ name: file.name, message: `Máximo ${maxFiles} archivo(s)` })
      continue
    }

    if (total + file.size > maxTotalSize) {
      rejections.push({
        name: file.name,
        message: `Excede el total de ${formatBytes(maxTotalSize)}`,
      })
      continue
    }

    total += file.size
    count += 1
    accepted.push(file)
  }

  return { accepted, rejections }
}

export const fileUploadItemSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('pending'), file: z.instanceof(File) }),
  z.object({
    kind: z.literal('stored'),
    id: z.string().min(1),
    name: z.string().min(1),
    size: z.number().int().nonnegative(),
    type: z.string(),
  }),
])
