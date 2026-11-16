import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@/lib/zodResolver'
import { z } from 'zod'
import { Form, Field } from '@/components/ui/Form'
import { Input } from '@/components/ui/Input'
import { FieldArray } from './FieldArray'
import type { FieldArrayProps } from './FieldArray.types'

const schema = z.object({
  unidades: z
    .array(z.object({ nombre: z.string().min(1, 'requerido') }))
    .min(1, 'agrega al menos una unidad')
    .max(3, 'maximo 3'),
})

type Values = z.infer<typeof schema>

function Harness({
  onSubmit,
  defaultValues,
  max,
  defaultItem,
  canRemove,
}: {
  onSubmit?: (data: Values) => void
  defaultValues?: Values
  max?: number
  defaultItem?: FieldArrayProps<Values>['defaultItem']
  canRemove?: FieldArrayProps<Values>['canRemove']
}) {
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? { unidades: [] },
    mode: 'onTouched',
  })
  return (
    <Form form={form} onSubmit={onSubmit ?? (() => {})}>
      <FieldArray<Values>
        name="unidades"
        defaultItem={defaultItem ?? (() => ({ nombre: '' }))}
        max={max}
        addLabel="Agregar unidad"
        itemLabel={(i) => `Unidad ${i + 1}`}
        canRemove={canRemove}
        emptyState="Sin unidades"
        renderSummary={({ index, hasError }) => (
          <span>
            Unidad {index + 1}
            {hasError ? ' (con errores)' : ''}
          </span>
        )}
        renderDetail={({ index }) => (
          <Field<Values> name={`unidades.${index}.nombre`} label={`Nombre ${index + 1}`}>
            <Input />
          </Field>
        )}
      />
      <button type="submit">Enviar</button>
    </Form>
  )
}

describe('FieldArray', () => {
  it('muestra el estado vacío cuando no hay items', () => {
    render(<Harness />)
    expect(screen.getByText('Sin unidades')).toBeInTheDocument()
  })

  it('agrega un item al hacer click en agregar', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(screen.getByRole('button', { name: 'Agregar unidad' }))
    expect(screen.getByText('Unidad 1')).toBeInTheDocument()
    expect(screen.getByLabelText('Nombre 1')).toBeInTheDocument()
  })

  it('el item recién agregado queda expandido', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(screen.getByRole('button', { name: 'Agregar unidad' }))
    const toggle = screen.getByRole('button', { expanded: true })
    const content = document.getElementById(toggle.getAttribute('aria-controls')!)!
    expect(content).not.toHaveAttribute('inert')
  })

  it('colapsa y expande al togglear', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(screen.getByRole('button', { name: 'Agregar unidad' }))
    const toggle = screen.getByRole('button', { expanded: true })
    const content = document.getElementById(toggle.getAttribute('aria-controls')!)!
    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(content).toHaveAttribute('inert')
    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(content).not.toHaveAttribute('inert')
  })

  it('elimina un item', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(screen.getByRole('button', { name: 'Agregar unidad' }))
    await user.click(screen.getByRole('button', { name: 'Eliminar Unidad 1' }))
    expect(screen.queryByText('Unidad 1')).not.toBeInTheDocument()
    expect(screen.getByText('Sin unidades')).toBeInTheDocument()
  })

  it('deshabilita agregar al alcanzar el máximo', async () => {
    const user = userEvent.setup()
    render(<Harness max={2} />)
    const add = screen.getByRole('button', { name: 'Agregar unidad' })
    await user.click(add)
    await user.click(add)
    expect(add).toBeDisabled()
  })

  it('muestra el error de nivel de array tras submit con lista vacía', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(screen.getByRole('button', { name: 'Enviar' }))
    expect(await screen.findByText('agrega al menos una unidad')).toBeInTheDocument()
  })

  it('no llama onSubmit cuando un item es inválido', async () => {
    const user = userEvent.setup()
    const handle = vi.fn()
    render(<Harness onSubmit={handle} />)
    await user.click(screen.getByRole('button', { name: 'Agregar unidad' }))
    await user.click(screen.getByRole('button', { name: 'Enviar' }))
    expect(handle).not.toHaveBeenCalled()
  })

  it('refleja hasError en el resumen del item inválido', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(screen.getByRole('button', { name: 'Agregar unidad' }))
    await user.click(screen.getByRole('button', { name: 'Enviar' }))
    expect(await screen.findByText('Unidad 1 (con errores)')).toBeInTheDocument()
  })

  it('llama onSubmit con datos válidos', async () => {
    const user = userEvent.setup()
    const handle = vi.fn()
    render(<Harness onSubmit={handle} />)
    await user.click(screen.getByRole('button', { name: 'Agregar unidad' }))
    await user.type(screen.getByLabelText('Nombre 1'), 'Unidad A')
    await user.click(screen.getByRole('button', { name: 'Enviar' }))
    expect(handle).toHaveBeenCalledTimes(1)
    expect(handle.mock.calls[0][0]).toEqual({ unidades: [{ nombre: 'Unidad A' }] })
  })

  it('no evalúa defaultItem durante el render', () => {
    const crear = vi.fn(() => ({ nombre: '' }))
    render(<Harness defaultItem={crear} />)
    expect(crear).not.toHaveBeenCalled()
  })

  it('evalúa defaultItem una vez por cada item agregado', async () => {
    const user = userEvent.setup()
    const crear = vi.fn(() => ({ nombre: '' }))
    render(<Harness defaultItem={crear} />)
    const add = screen.getByRole('button', { name: 'Agregar unidad' })
    await user.click(add)
    expect(crear).toHaveBeenCalledTimes(1)
    await user.click(add)
    expect(crear).toHaveBeenCalledTimes(2)
  })

  it('oculta la acción de eliminar cuando canRemove devuelve false', async () => {
    const user = userEvent.setup()
    render(<Harness canRemove={() => false} />)
    await user.click(screen.getByRole('button', { name: 'Agregar unidad' }))
    expect(screen.queryByRole('button', { name: 'Eliminar Unidad 1' })).not.toBeInTheDocument()
  })

  it('conserva la acción de eliminar cuando canRemove devuelve true', async () => {
    const user = userEvent.setup()
    render(<Harness canRemove={() => true} />)
    await user.click(screen.getByRole('button', { name: 'Agregar unidad' }))
    expect(screen.getByRole('button', { name: 'Eliminar Unidad 1' })).toBeInTheDocument()
  })

  it('decide por índice cuáles items pueden eliminarse', async () => {
    const user = userEvent.setup()
    render(<Harness canRemove={(index) => index === 1} />)
    const add = screen.getByRole('button', { name: 'Agregar unidad' })
    await user.click(add)
    await user.click(add)
    expect(screen.queryByRole('button', { name: 'Eliminar Unidad 1' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Eliminar Unidad 2' })).toBeInTheDocument()
  })

  it('carga items existentes colapsados desde defaultValues', () => {
    render(<Harness defaultValues={{ unidades: [{ nombre: 'X' }, { nombre: 'Y' }] }} />)
    expect(screen.getAllByRole('button', { expanded: false })).toHaveLength(2)
  })
})
