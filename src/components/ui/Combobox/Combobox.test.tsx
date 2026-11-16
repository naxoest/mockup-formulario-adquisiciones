import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { Form, Field } from '@/components/ui/Form'
import { Combobox } from './Combobox'
import type { ComboboxOption } from './Combobox.types'

const OPTIONS: ComboboxOption[] = [
  { value: 'cl', label: 'Chile' },
  { value: 'ar', label: 'Argentina' },
  { value: 'pe', label: 'Perú' },
  { value: 'co', label: 'Colombia' },
]

describe('Combobox', () => {
  it('en modo stand-alone abre el listbox al hacer click', async () => {
    const user = userEvent.setup()
    function Controlled() {
      const [value, setValue] = useState<string | null>(null)
      return <Combobox options={OPTIONS} value={value} onChange={setValue} />
    }
    render(<Controlled />)
    const trigger = screen.getByRole('combobox')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await user.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByPlaceholderText('Buscar...')).toBeInTheDocument()
  })

  it('selecciona una opción y refleja el label en el trigger', async () => {
    const user = userEvent.setup()
    function Controlled() {
      const [value, setValue] = useState<string | null>(null)
      return <Combobox options={OPTIONS} value={value} onChange={setValue} />
    }
    render(<Controlled />)
    await user.click(screen.getByRole('combobox'))
    await user.click(screen.getByText('Argentina'))
    expect(screen.getByRole('combobox')).toHaveTextContent('Argentina')
  })

  it('filtra opciones al escribir en el input de búsqueda', async () => {
    const user = userEvent.setup()
    render(<Combobox options={OPTIONS} />)
    await user.click(screen.getByRole('combobox'))
    await user.type(screen.getByPlaceholderText('Buscar...'), 'per')
    expect(screen.getByText('Perú')).toBeInTheDocument()
    expect(screen.queryByText('Chile')).not.toBeInTheDocument()
    expect(screen.queryByText('Argentina')).not.toBeInTheDocument()
  })

  it('muestra emptyMessage cuando ningún resultado coincide', async () => {
    const user = userEvent.setup()
    render(<Combobox options={OPTIONS} emptyMessage="Nada encontrado" />)
    await user.click(screen.getByRole('combobox'))
    await user.type(screen.getByPlaceholderText('Buscar...'), 'zzz')
    expect(screen.getByText('Nada encontrado')).toBeInTheDocument()
  })

  it('clearable limpia el valor a null', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    function Controlled() {
      const [value, setValue] = useState<string | null>('cl')
      return (
        <Combobox
          options={OPTIONS}
          value={value}
          onChange={(next) => {
            onChange(next)
            setValue(next)
          }}
        />
      )
    }
    render(<Controlled />)
    expect(screen.getByRole('combobox')).toHaveTextContent('Chile')
    await user.click(screen.getByLabelText('Limpiar selección'))
    expect(onChange).toHaveBeenCalledWith(null)
  })

  it('navega con ArrowDown y selecciona con Enter', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Combobox options={OPTIONS} onChange={onChange} />)
    await user.click(screen.getByRole('combobox'))
    await user.keyboard('{ArrowDown}{ArrowDown}{Enter}')
    expect(onChange).toHaveBeenCalled()
  })

  it('Escape cierra el listbox', async () => {
    const user = userEvent.setup()
    render(<Combobox options={OPTIONS} />)
    const trigger = screen.getByRole('combobox')
    await user.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await user.keyboard('{Escape}')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('dentro de Field consume el contexto y envía el valor', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    function TestForm() {
      const form = useForm({ defaultValues: { country: '' } })
      return (
        <Form form={form} onSubmit={onSubmit}>
          <Field name="country" label="País">
            <Combobox options={OPTIONS} />
          </Field>
          <button type="submit">Enviar</button>
        </Form>
      )
    }
    render(<TestForm />)
    await user.click(screen.getByRole('combobox', { name: 'País' }))
    await user.click(screen.getByText('Perú'))
    await user.click(screen.getByRole('button', { name: 'Enviar' }))
    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit.mock.calls[0][0]).toEqual({ country: 'pe' })
  })

  it('en modo async no filtra localmente y llama onSearchChange', async () => {
    const user = userEvent.setup()
    const onSearchChange = vi.fn()
    function Wrapper() {
      const [query, setQuery] = useState('')
      return (
        <Combobox
          options={OPTIONS}
          searchValue={query}
          onSearchChange={(q) => {
            setQuery(q)
            onSearchChange(q)
          }}
        />
      )
    }
    render(<Wrapper />)
    await user.click(screen.getByRole('combobox'))
    await user.type(screen.getByPlaceholderText('Buscar...'), 'xyz')
    expect(onSearchChange).toHaveBeenCalled()
    expect(screen.getByText('Chile')).toBeInTheDocument()
    expect(screen.getByText('Argentina')).toBeInTheDocument()
  })

  it('muestra loadingMessage cuando loading es true', async () => {
    const user = userEvent.setup()
    render(
      <Combobox
        options={[]}
        searchValue=""
        onSearchChange={() => {}}
        loading
        loadingMessage="Cargando datos..."
      />,
    )
    await user.click(screen.getByRole('combobox'))
    expect(screen.getByText('Cargando datos...')).toBeInTheDocument()
  })

  it('selectedOption override muestra label aunque no esté en options', () => {
    render(
      <Combobox
        options={[]}
        value="cl"
        selectedOption={{ value: 'cl', label: 'Chile (precargado)' }}
      />,
    )
    expect(screen.getByRole('combobox')).toHaveTextContent('Chile (precargado)')
  })

  it('en modo multi permite seleccionar varias opciones sin cerrar', async () => {
    const user = userEvent.setup()
    function Multi() {
      const [value, setValue] = useState<string[]>([])
      return <Combobox multiple options={OPTIONS} value={value} onChange={setValue} />
    }
    render(<Multi />)
    const trigger = screen.getByRole('combobox')
    await user.click(trigger)
    await user.click(screen.getByRole('option', { name: 'Chile' }))
    await user.click(screen.getByRole('option', { name: 'Perú' }))
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(trigger).toHaveTextContent('Chile')
    expect(trigger).toHaveTextContent('Perú')
  })

  it('en multi un click sobre opción seleccionada la deselecciona', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    function Multi() {
      const [value, setValue] = useState<string[]>(['cl'])
      return (
        <Combobox
          multiple
          options={OPTIONS}
          value={value}
          onChange={(next) => {
            onChange(next)
            setValue(next)
          }}
        />
      )
    }
    render(<Multi />)
    await user.click(screen.getByRole('combobox'))
    await user.click(screen.getByRole('option', { name: 'Chile' }))
    expect(onChange).toHaveBeenLastCalledWith([])
  })

  it('en multi el botón X de un chip lo remueve', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    function Multi() {
      const [value, setValue] = useState<string[]>(['cl', 'ar'])
      return (
        <Combobox
          multiple
          options={OPTIONS}
          value={value}
          onChange={(next) => {
            onChange(next)
            setValue(next)
          }}
        />
      )
    }
    render(<Multi />)
    await user.click(screen.getByLabelText('Quitar Chile'))
    expect(onChange).toHaveBeenLastCalledWith(['ar'])
  })

  it('en multi dentro de Field envía un array', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    function TestForm() {
      const form = useForm({ defaultValues: { countries: [] as string[] } })
      return (
        <Form form={form} onSubmit={onSubmit}>
          <Field name="countries" label="Países">
            <Combobox multiple options={OPTIONS} />
          </Field>
          <button type="submit">Enviar</button>
        </Form>
      )
    }
    render(<TestForm />)
    await user.click(screen.getByRole('combobox', { name: /Países/ }))
    await user.click(screen.getByRole('option', { name: 'Chile' }))
    await user.click(screen.getByRole('option', { name: 'Argentina' }))
    await user.click(screen.getByRole('button', { name: 'Enviar' }))
    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit.mock.calls[0][0]).toEqual({ countries: ['cl', 'ar'] })
  })

  it('en multi selectedOptions externos muestran chips aunque no estén en options', () => {
    render(
      <Combobox
        multiple
        options={[]}
        value={['cl', 'ar']}
        selectedOptions={[
          { value: 'cl', label: 'Chile (precargado)' },
          { value: 'ar', label: 'Argentina (precargado)' },
        ]}
      />,
    )
    expect(screen.getByText('Chile (precargado)')).toBeInTheDocument()
    expect(screen.getByText('Argentina (precargado)')).toBeInTheDocument()
  })

  it('en multi con enableSelectAll muestra el botón "Seleccionar todas"', async () => {
    const user = userEvent.setup()
    render(<Combobox multiple options={OPTIONS} value={[]} enableSelectAll />)
    await user.click(screen.getByRole('combobox'))
    expect(screen.getByRole('button', { name: 'Seleccionar todas' })).toBeInTheDocument()
  })

  it('en multi sin enableSelectAll no muestra el botón "Seleccionar todas"', async () => {
    const user = userEvent.setup()
    render(<Combobox multiple options={OPTIONS} value={[]} />)
    await user.click(screen.getByRole('combobox'))
    expect(screen.queryByRole('button', { name: 'Seleccionar todas' })).not.toBeInTheDocument()
  })

  it('"Seleccionar todas" selecciona todas las opciones visibles', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    function Multi() {
      const [value, setValue] = useState<string[]>([])
      return (
        <Combobox
          multiple
          options={OPTIONS}
          value={value}
          onChange={(next) => {
            onChange(next)
            setValue(next)
          }}
          enableSelectAll
        />
      )
    }
    render(<Multi />)
    await user.click(screen.getByRole('combobox'))
    await user.click(screen.getByRole('button', { name: 'Seleccionar todas' }))
    expect(onChange).toHaveBeenLastCalledWith(['cl', 'ar', 'pe', 'co'])
  })

  it('"Deseleccionar todas" cuando todo está seleccionado limpia la selección', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    function Multi() {
      const [value, setValue] = useState<string[]>(['cl', 'ar', 'pe', 'co'])
      return (
        <Combobox
          multiple
          options={OPTIONS}
          value={value}
          onChange={(next) => {
            onChange(next)
            setValue(next)
          }}
          enableSelectAll
        />
      )
    }
    render(<Multi />)
    await user.click(screen.getByRole('combobox'))
    await user.click(screen.getByRole('button', { name: 'Deseleccionar todas' }))
    expect(onChange).toHaveBeenLastCalledWith([])
  })

  it('"Seleccionar todas" con búsqueda activa solo afecta opciones filtradas', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    function Multi() {
      const [value, setValue] = useState<string[]>([])
      return (
        <Combobox
          multiple
          options={OPTIONS}
          value={value}
          onChange={(next) => {
            onChange(next)
            setValue(next)
          }}
          enableSelectAll
        />
      )
    }
    render(<Multi />)
    await user.click(screen.getByRole('combobox'))
    await user.type(screen.getByPlaceholderText('Buscar...'), 'a')
    await user.click(screen.getByRole('button', { name: 'Seleccionar todas' }))
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0]
    expect(lastCall).toEqual(expect.arrayContaining(['ar', 'co']))
    expect(lastCall).toHaveLength(2)
  })
})
