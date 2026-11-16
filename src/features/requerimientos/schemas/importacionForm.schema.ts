import { z } from 'zod'
import { fileUploadItemSchema } from '@/components/ui/FileUpload'

export const importacionFormSchema = z.object({
  tipoSolicitante: z.string().min(1, 'Seleccione el tipo de solicitante'),
  campus: z.string().min(1, 'Seleccione el campus'),
  solicitante: z.string().min(1, 'Seleccione el solicitante'),
  archivo: z.array(fileUploadItemSchema).length(1, 'Seleccione la planilla'),
})

export type ImportacionFormValores = z.infer<typeof importacionFormSchema>
