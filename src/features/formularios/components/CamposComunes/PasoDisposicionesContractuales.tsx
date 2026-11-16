import { Checkbox } from '@/components/ui/Checkbox'
import { Field } from '@/components/ui/Form'
import { NumberInput } from '@/components/ui/NumberInput'
import { RadioGroup } from '@/components/ui/RadioGroup'
import { OPCIONES_TOPE_CONTRATO } from '@/features/formularios/utils/catalogosFormulario'

interface CamposDisposicionesValues {
  disposiciones: {
    porcentajeMultaDiaria: number | null
    topeDiasMulta: number | null
    topePorcentajeContrato: '10' | '20'
    plazoPagoDias: number | null
    aceptaTerminoAnticipadoArt130: boolean
  }
}

export function PasoDisposicionesContractuales() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-mercury-900">
          Disposiciones Contractuales Comunes (Normativa ULagos)
        </h3>
        <p className="text-xs text-mercury-500">
          Reglas transversales de multas, término anticipado y condiciones de pago aplicables a la
          contratación.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field<CamposDisposicionesValues>
          name="disposiciones.porcentajeMultaDiaria"
          label="Multa diaria por atraso (%)"
          description="Estándar institucional: 0,5% diario sobre valor neto atrasado."
          required
        >
          <NumberInput min={0.1} max={5} step={0.1} decimals={1} suffix="%" />
        </Field>

        <Field<CamposDisposicionesValues>
          name="disposiciones.topeDiasMulta"
          label="Tope máximo de días de atraso"
          description="Estándar institucional: 20 días hábiles o corridos."
          required
        >
          <NumberInput min={1} max={60} step={1} suffix="días" />
        </Field>

        <Field<CamposDisposicionesValues>
          name="disposiciones.plazoPagoDias"
          label="Plazo de pago (días)"
          description="Habitualmente 30 días contra recepción conforme y visación."
          required
        >
          <NumberInput min={1} max={90} step={5} suffix="días" />
        </Field>
      </div>

      <Field<CamposDisposicionesValues>
        name="disposiciones.topePorcentajeContrato"
        label="Límite acumulado de multas sobre el total del contrato"
        required
      >
        <RadioGroup options={OPCIONES_TOPE_CONTRATO} />
      </Field>

      <div className="rounded-xl border border-saffron-300 bg-saffron-50 p-4">
        <Field<CamposDisposicionesValues>
          name="disposiciones.aceptaTerminoAnticipadoArt130"
          label="Cláusula de Término Anticipado (Art. 130 Reglamento Ley N° 19.886)"
          hideLabel
        >
          <Checkbox
            label="Incluir facultad de término anticipado sin derecho a indemnización (Art. 130 Ley 19.886)"
            description="La Universidad de Los Lagos se reserva el derecho de poner término anticipado al contrato por incumplimientos graves, fuerza mayor o caso fortuito."
          />
        </Field>
      </div>
    </div>
  )
}
