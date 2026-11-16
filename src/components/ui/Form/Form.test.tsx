import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@/lib/zodResolver'
import { z } from 'zod'
import { Form } from './Form'
import { Field } from './Field'
import { Input } from '@/components/ui/Input'

const schema = z.object({
  email: z.string().min(1, 'requerido').email('email invalido'),
})

type Values = z.infer<typeof schema>

function TestForm({
  onSubmit,
  defaultValues,
}: {
  onSubmit: (data: Values) => void
  defaultValues?: Partial<Values>
}) {
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', ...defaultValues },
  })
  return (
    <Form form={form} onSubmit={onSubmit}>
      <Field<Values> name="email" label="Email">
        <Input type="email" />
      </Field>
      <button type="submit">Enviar</button>
    </Form>
  )
}

describe('Form', () => {
  it('renderiza el form con sus hijos', () => {
    render(<TestForm onSubmit={vi.fn()} />)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Enviar' })).toBeInTheDocument()
  })

  it('llama onSubmit con datos validos', async () => {
    const user = userEvent.setup()
    const handle = vi.fn()
    render(<TestForm onSubmit={handle} />)
    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.click(screen.getByRole('button', { name: 'Enviar' }))
    expect(handle).toHaveBeenCalledTimes(1)
    expect(handle.mock.calls[0][0]).toEqual({ email: 'test@example.com' })
  })

  it('no llama onSubmit cuando Zod falla', async () => {
    const user = userEvent.setup()
    const handle = vi.fn()
    render(<TestForm onSubmit={handle} />)
    await user.type(screen.getByLabelText('Email'), 'no-es-email')
    await user.click(screen.getByRole('button', { name: 'Enviar' }))
    expect(handle).not.toHaveBeenCalled()
    expect(await screen.findByText('email invalido')).toBeInTheDocument()
  })

  it('aplica defaultValues', () => {
    render(<TestForm onSubmit={vi.fn()} defaultValues={{ email: 'pre@cargado.com' }} />)
    expect(screen.getByLabelText('Email')).toHaveValue('pre@cargado.com')
  })
})
