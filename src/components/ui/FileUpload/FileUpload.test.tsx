import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@/lib/zodResolver'
import { Field, Form } from '@/components/ui/Form'
import { FileUpload } from './FileUpload'
import { fileUploadItemSchema } from './FileUpload.utils'
import type { FileUploadItem, FileUploadProps } from './FileUpload.types'

function makeFile(name: string, size: number, type: string, lastModified = 1): File {
  return new File([new Uint8Array(size)], name, { type, lastModified })
}

function getInput(container: HTMLElement): HTMLInputElement {
  return container.querySelector('input[type="file"]') as HTMLInputElement
}

function dropData(files: File[]) {
  return {
    dataTransfer: {
      files,
      items: files.map((file) => ({ kind: 'file', type: file.type, getAsFile: () => file })),
      types: ['Files'],
    },
  }
}

interface ControlledProps extends Omit<FileUploadProps, 'value' | 'onChange'> {
  initial?: FileUploadItem[]
  onChange?: (value: FileUploadItem[]) => void
}

function Controlled({ initial = [], onChange, ...props }: ControlledProps) {
  const [value, setValue] = useState<FileUploadItem[]>(initial)
  return (
    <FileUpload
      {...props}
      value={value}
      onChange={(next) => {
        onChange?.(next)
        setValue(next)
      }}
    />
  )
}

const schema = z.object({
  adjuntos: z.array(fileUploadItemSchema).min(1, 'Adjunte al menos un archivo'),
})

type Values = z.infer<typeof schema>

function Formulario({ onSubmit }: { onSubmit: (values: Values) => void }) {
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { adjuntos: [] },
    mode: 'onTouched',
  })
  return (
    <Form form={form} onSubmit={onSubmit}>
      <Field<Values>
        name="adjuntos"
        label="Adjuntos"
        description="Documentos de respaldo."
        required
      >
        <FileUpload categories={['document']} />
      </Field>
      <button type="submit">Enviar</button>
    </Form>
  )
}

describe('FileUpload', () => {
  it('agrega un archivo válido como elemento pendiente', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const { container } = render(<Controlled onChange={onChange} />)
    const file = makeFile('cotizacion.pdf', 10, 'application/pdf')

    await user.upload(getInput(container), file)

    expect(await screen.findByText('cotizacion.pdf')).toBeInTheDocument()
    expect(onChange).toHaveBeenLastCalledWith([{ kind: 'pending', file }])
  })

  it('rechaza un tipo no permitido y lo anuncia', async () => {
    const user = userEvent.setup({ applyAccept: false })
    const onChange = vi.fn()
    const { container } = render(<Controlled categories={['document']} onChange={onChange} />)

    await user.upload(getInput(container), makeFile('foto.png', 10, 'image/png'))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'foto.png: tipo de archivo no permitido en este formulario',
    )
    expect(onChange).not.toHaveBeenCalled()
  })

  it('rechaza un archivo duplicado', async () => {
    const user = userEvent.setup()
    const file = makeFile('orden.pdf', 10, 'application/pdf')
    const { container } = render(<Controlled initial={[{ kind: 'pending', file }]} />)

    await user.upload(getInput(container), file)

    expect(await screen.findByRole('alert')).toHaveTextContent('orden.pdf: Archivo duplicado')
  })

  it('traduce el rechazo por cantidad en modo de un solo archivo', async () => {
    const { container } = render(<Controlled maxFiles={1} />)
    const root = getInput(container).parentElement as HTMLElement
    const primero = makeFile('uno.pdf', 10, 'application/pdf', 1)
    const segundo = makeFile('dos.pdf', 10, 'application/pdf', 2)

    await act(async () => {
      fireEvent.drop(root, dropData([primero, segundo]))
    })

    expect(await screen.findByText('uno.pdf')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('dos.pdf: Máximo 1 archivo(s)')
  })

  it('deshabilita la selección al alcanzar la capacidad', () => {
    const { container } = render(
      <Controlled
        maxFiles={1}
        initial={[{ kind: 'pending', file: makeFile('uno.pdf', 10, 'application/pdf') }]}
      />,
    )

    expect(getInput(container)).toBeDisabled()
    expect(screen.getByText('Se alcanzó el máximo de archivos')).toBeInTheDocument()
  })

  it('muestra y elimina un documento guardado', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <Controlled
        onChange={onChange}
        initial={[
          { kind: 'stored', id: '7', name: 'orden.pdf', size: 2048, type: 'application/pdf' },
        ]}
      />,
    )

    expect(screen.getByText('orden.pdf')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Eliminar orden.pdf' }))
    expect(onChange).toHaveBeenLastCalledWith([])
  })

  it('se integra con Field: etiqueta, descripción, error y foco', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<Formulario onSubmit={onSubmit} />)

    const input = screen.getByLabelText(/Adjuntos/)
    expect(input).toHaveAttribute('type', 'file')
    expect(input).not.toHaveAttribute('aria-label')
    expect(input).not.toHaveAttribute('style')
    expect(input).toHaveAttribute('aria-required', 'true')
    expect(input.getAttribute('aria-describedby')).toContain(
      screen.getByText('Documentos de respaldo.').id,
    )

    await user.click(screen.getByRole('button', { name: 'Enviar' }))

    expect(await screen.findByText('Adjunte al menos un archivo')).toBeInTheDocument()
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveFocus()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('envía los archivos seleccionados dentro de un formulario', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<Formulario onSubmit={onSubmit} />)
    const file = makeFile('cotizacion.pdf', 10, 'application/pdf')

    await user.upload(screen.getByLabelText(/Adjuntos/), file)
    expect(await screen.findByText('cotizacion.pdf')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Enviar' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalled())
    expect(onSubmit.mock.calls[0][0]).toEqual({ adjuntos: [{ kind: 'pending', file }] })
  })
})

describe('FileUpload con extensiones restringidas', () => {
  const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

  it('limita el diálogo de selección a las extensiones indicadas', () => {
    const { container } = render(<Controlled categories={['document']} extensions={['.xlsx']} />)

    expect(getInput(container)).toHaveAttribute('accept', `${XLSX_MIME},.xlsx`)
  })

  it('muestra solo las extensiones permitidas, sin la nota de la categoría', () => {
    render(<Controlled categories={['document']} extensions={['.xlsx']} />)

    expect(screen.getByText('Documentos')).toBeInTheDocument()
    expect(screen.getByText('xlsx')).toBeInTheDocument()
    expect(screen.queryByText('pdf')).not.toBeInTheDocument()
    expect(
      screen.queryByText('Archivos PDF y documentos de Word, Excel y archivos de texto.'),
    ).not.toBeInTheDocument()
  })

  it('oculta las categorías que no tienen extensiones permitidas', () => {
    render(<Controlled extensions={['.xlsx']} />)

    expect(screen.getByText('Documentos')).toBeInTheDocument()
    expect(screen.queryByText('Imágenes')).not.toBeInTheDocument()
  })

  it('agrega un archivo con una extensión permitida', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const { container } = render(
      <Controlled categories={['document']} extensions={['.xlsx']} onChange={onChange} />,
    )
    const file = makeFile('planilla.xlsx', 10, XLSX_MIME)

    await user.upload(getInput(container), file)

    expect(await screen.findByText('planilla.xlsx')).toBeInTheDocument()
    expect(onChange).toHaveBeenLastCalledWith([{ kind: 'pending', file }])
  })

  it('rechaza un archivo de la categoría con otra extensión', async () => {
    const user = userEvent.setup({ applyAccept: false })
    const onChange = vi.fn()
    const { container } = render(
      <Controlled categories={['document']} extensions={['.xlsx']} onChange={onChange} />,
    )

    await user.upload(getInput(container), makeFile('orden.pdf', 10, 'application/pdf'))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'orden.pdf: tipo de archivo no permitido en este formulario',
    )
    expect(onChange).not.toHaveBeenCalled()
  })
})
