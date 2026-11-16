export type FileCategory = 'image' | 'document' | 'video' | 'audio'

export type FileExtension = `.${string}`

export interface FileFormat {
  mimes: readonly string[]
  extensions: readonly string[]
}

export interface FileCategoryDefinition {
  label: string
  note: string
  maxSize: number
  formats: readonly FileFormat[]
}

export interface FileDescriptor {
  name: string
  size: number
  type: string
}

export interface PendingFileItem {
  kind: 'pending'
  file: File
}

export interface StoredFileItem {
  kind: 'stored'
  id: string
  name: string
  size: number
  type: string
}

export type FileUploadItem = PendingFileItem | StoredFileItem

export interface FileRejectionMessage {
  name: string
  message: string
}

export interface FileUploadLimits {
  maxFiles: number
  maxTotalSize: number
}

export interface FileAdditionPlan {
  accepted: File[]
  rejections: FileRejectionMessage[]
}

export interface FileUploadProps {
  value?: FileUploadItem[]
  onChange?: (value: FileUploadItem[]) => void
  onBlur?: () => void
  categories?: readonly FileCategory[]
  extensions?: readonly FileExtension[]
  maxFiles?: number
  maxTotalSize?: number
  disabled?: boolean
  invalid?: boolean
  id?: string
  className?: string
}
