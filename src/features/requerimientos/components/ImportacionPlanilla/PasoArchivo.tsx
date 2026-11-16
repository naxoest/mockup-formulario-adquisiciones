import type { UseFormReturn } from 'react-hook-form'
import { Info } from 'lucide-react'
import { Combobox } from '@/components/ui/Combobox'
import { FileUpload } from '@/components/ui/FileUpload'
import { Field, Form } from '@/components/ui/Form'
import { useCascadaSolicitanteImportacion } from '@/features/requerimientos/hooks/useCascadaSolicitanteImportacion'
import type { ImportacionFormValores } from '@/features/requerimientos/schemas/importacionForm.schema'

interface PasoArchivoProps {
  form: UseFormReturn<ImportacionFormValores>
  onSubmit: (valores: ImportacionFormValores) => void
}

export function PasoArchivo({ form, onSubmit }: PasoArchivoProps) {
  const {
    tipoSolicitante,
    campus,
    opcionesTipo,
    cargandoTipos,
    opcionesCampus,
    cargandoCampus,
    opcionesSolicitante,
    cargandoSolicitantes,
  } = useCascadaSolicitanteImportacion(form)

  return (
    <Form form={form} onSubmit={onSubmit} className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Field<ImportacionFormValores> name="tipoSolicitante" label="Tipo de solicitante" required>
          <Combobox
            options={opcionesTipo}
            loading={cargandoTipos}
            placeholder="Seleccione un tipo"
          />
        </Field>
        <Field<ImportacionFormValores> name="campus" label="Campus" required>
          <Combobox
            options={opcionesCampus}
            loading={cargandoCampus}
            disabled={tipoSolicitante === ''}
            placeholder={
              tipoSolicitante === ''
                ? 'Elija primero el tipo de solicitante'
                : 'Seleccione un campus'
            }
          />
        </Field>
        <Field<ImportacionFormValores>
          name="solicitante"
          label="Solicitante"
          description="Carrera o unidad a la que pertenecen los requerimientos del archivo."
          required
        >
          <Combobox
            options={opcionesSolicitante}
            loading={cargandoSolicitantes}
            disabled={campus === ''}
            placeholder={campus === '' ? 'Elija primero el campus' : 'Busque un solicitante'}
          />
        </Field>
      </div>

      <Field<ImportacionFormValores> name="archivo" label="Planilla" required>
        <FileUpload categories={['document']} extensions={['.xlsx']} maxFiles={1} />
      </Field>

      <div className="flex items-start gap-3 rounded-xl border border-primary-200 bg-primary-50 p-4">
        <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary-700" />
        <div className="flex flex-col gap-3 text-sm text-primary-900">
          <p>
            El archivo se lee en su navegador: solo se envían sus datos y el archivo no se almacena
            en el sistema.
          </p>
          <p>
            El archivo debe contener todos los requerimientos del solicitante y cada fila debe tener
            en la columna «# Item» un valor que no se repita. Al importar, los ítems nuevos se
            registran, los ya registrados se actualizan y los que no figuren en el archivo se
            eliminan. Un requerimiento eliminado conserva sus eventos y se restaura si su ítem
            vuelve a figurar.
          </p>
          <p>
            Mantenga siempre el mismo ítem para cada requerimiento: no reutilice ni renumere los
            ítems.
          </p>
        </div>
      </div>
    </Form>
  )
}
