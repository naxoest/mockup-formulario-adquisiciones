import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@/lib/zodResolver'
import { z } from 'zod'
import { Form } from './Form'
import { Field } from './Field'
import { Input } from '@/components/ui/Input'

const schema = z.object({
  name: z.string().min(3, 'minimo 3 caracteres'),
})

type Values = z.infer<typeof schema>

function FieldWrapper({
  children,
  defaultValues,
}: {
  children: ReactNode
  defaultValues?: Partial<Values>
}) {
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', ...defaultValues },
  })
  return (
    <Form form={form} onSubmit={() => {}}>
      {children}
    </Form>
  )
}

describe('Field', () => {
  it('conecta label al control via htmlFor e id', () => {
    render(
      <FieldWrapper>
        <Field<Values> name="name" label="Nombre">
          <Input />
        </Field>
      </FieldWrapper>,
    )
    const input = screen.getByLabelText('Nombre')
    const label = screen.getByText('Nombre').closest('label')
    expect(label).toHaveAttribute('for', input.id)
  })

  it('muestra asterisco cuando required', () => {
    render(
      <FieldWrapper>
        <Field<Values> name="name" label="Nombre" required>
          <Input />
        </Field>
      </FieldWrapper>,
    )
    expect(screen.getByLabelText('requerido')).toHaveTextContent('*')
  })

  it('muestra (opcional) cuando optional y no required', () => {
    render(
      <FieldWrapper>
        <Field<Values> name="name" label="Nombre" optional>
          <Input />
        </Field>
      </FieldWrapper>,
    )
    expect(screen.getByText('(opcional)')).toBeInTheDocument()
  })

  it('renderiza description', () => {
    render(
      <FieldWrapper>
        <Field<Values> name="name" label="Nombre" description="Ayuda contextual">
          <Input />
        </Field>
      </FieldWrapper>,
    )
    expect(screen.getByText('Ayuda contextual')).toBeInTheDocument()
  })

  it('muestra mensaje de error de Zod tras submit invalido', async () => {
    const { default: userEvent } = await import('@testing-library/user-event')
    const user = userEvent.setup()
    function FormWithSubmit() {
      const form = useForm<Values>({
        resolver: zodResolver(schema),
        defaultValues: { name: '' },
      })
      return (
        <Form form={form} onSubmit={() => {}}>
          <Field<Values> name="name" label="Nombre">
            <Input />
          </Field>
          <button type="submit">Enviar</button>
        </Form>
      )
    }
    render(<FormWithSubmit />)
    await user.click(screen.getByRole('button', { name: 'Enviar' }))
    const error = await screen.findByRole('alert')
    expect(error).toHaveTextContent('minimo 3 caracteres')
  })

  it('aplica aria-invalid y aria-describedby al input cuando hay error', async () => {
    const { default: userEvent } = await import('@testing-library/user-event')
    const user = userEvent.setup()
    function FormWithSubmit() {
      const form = useForm<Values>({
        resolver: zodResolver(schema),
        defaultValues: { name: '' },
      })
      return (
        <Form form={form} onSubmit={() => {}}>
          <Field<Values> name="name" label="Nombre">
            <Input />
          </Field>
          <button type="submit">Enviar</button>
        </Form>
      )
    }
    render(<FormWithSubmit />)
    await user.click(screen.getByRole('button', { name: 'Enviar' }))
    const input = screen.getByLabelText('Nombre')
    await screen.findByRole('alert')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input.getAttribute('aria-describedby')).toBeTruthy()
  })
})
