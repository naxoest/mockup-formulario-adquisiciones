import { useState } from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Eye } from 'lucide-react'
import { DataTable } from './DataTable'
import type { ColumnDef, FetchDataParams, RowAction } from './DataTable.types'

interface Item {
  id: number
  name: string
  email: string
}

const columns: ColumnDef<Item>[] = [
  { field: 'id', header: 'ID', sortable: true },
  { field: 'name', header: 'Nombre', sortable: true },
  { field: 'email', header: 'Correo' },
]

const data: Item[] = [
  { id: 1, name: 'Ana', email: 'ana@test.cl' },
  { id: 2, name: 'Beto', email: 'beto@test.cl' },
  { id: 3, name: 'Carla', email: 'carla@test.cl' },
]

function TablaServidor({
  fetchData = vi.fn(),
  paginaInicial = 1,
  totalRows = 30,
  filas = data,
}: {
  fetchData?: (params: FetchDataParams) => void
  paginaInicial?: number
  totalRows?: number
  filas?: Item[]
}) {
  const [page, setPage] = useState(paginaInicial)

  return (
    <>
      <button type="button" onClick={() => setPage(1)}>
        Aplicar filtro
      </button>
      <DataTable<Item>
        ariaLabel="Personas"
        columns={columns}
        data={filas}
        apiMode
        fetchData={fetchData}
        totalRows={totalRows}
        page={page}
        onPageChange={setPage}
        searchDebounceMs={0}
      />
    </>
  )
}

describe('DataTable', () => {
  it('renders rows from data', () => {
    render(<DataTable<Item> columns={columns} data={data} />)
    expect(screen.getByText('Ana')).toBeInTheDocument()
    expect(screen.getByText('Beto')).toBeInTheDocument()
    expect(screen.getByText('Carla')).toBeInTheDocument()
  })

  it('renders empty message when no data', () => {
    render(<DataTable<Item> columns={columns} data={[]} emptyMessage="Sin resultados" />)
    expect(screen.getByText('Sin resultados')).toBeInTheDocument()
  })

  it('fires onRowClick when a row is clicked', async () => {
    const user = userEvent.setup()
    const onRowClick = vi.fn()
    render(<DataTable<Item> columns={columns} data={data} onRowClick={onRowClick} />)
    await user.click(screen.getByText('Ana'))
    expect(onRowClick).toHaveBeenCalledWith(data[0])
  })

  it('renders action buttons when actions are provided', () => {
    const actions: RowAction<Item>[] = [
      {
        key: 'view',
        label: 'Ver',
        icon: <Eye size={16} />,
        onClick: vi.fn(),
      },
    ]
    render(<DataTable<Item> columns={columns} data={data} actions={actions} />)
    const viewButtons = screen.getAllByLabelText('Ver')
    expect(viewButtons).toHaveLength(data.length)
  })

  it('fires action onClick with the row', async () => {
    const user = userEvent.setup()
    const handleView = vi.fn()
    const actions: RowAction<Item>[] = [
      {
        key: 'view',
        label: 'Ver',
        icon: <Eye size={16} />,
        onClick: handleView,
      },
    ]
    render(<DataTable<Item> columns={columns} data={data} actions={actions} />)
    const viewButtons = screen.getAllByLabelText('Ver')
    await user.click(viewButtons[0])
    expect(handleView).toHaveBeenCalledWith(data[0])
  })

  it('shows default loading fallback when loading and no renderLoading', () => {
    render(<DataTable<Item> columns={columns} data={[]} loading />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('shows renderLoading when provided', () => {
    render(
      <DataTable<Item>
        columns={columns}
        data={[]}
        loading
        renderLoading={() => <div>Custom Loader</div>}
      />,
    )
    expect(screen.getByText('Custom Loader')).toBeInTheDocument()
  })

  it('renders the title when provided', () => {
    render(<DataTable<Item> columns={columns} data={data} title="Lista de usuarios" />)
    expect(screen.getByRole('heading', { name: 'Lista de usuarios' })).toBeInTheDocument()
  })
})

describe('DataTable - filas expandibles', () => {
  it('no renderiza columna de expansión cuando renderExpandedRow no se provee', () => {
    render(<DataTable<Item> columns={columns} data={data} />)
    expect(screen.queryByLabelText('Expandir fila')).not.toBeInTheDocument()
  })

  it('renderiza un botón de expansión por fila cuando renderExpandedRow se provee', () => {
    render(
      <DataTable<Item>
        columns={columns}
        data={data}
        renderExpandedRow={(row) => <div>Detalles de {row.name}</div>}
      />,
    )
    const expandButtons = screen.getAllByLabelText('Expandir fila')
    expect(expandButtons).toHaveLength(data.length)
  })

  it('no muestra el contenido expandido hasta que se hace click', () => {
    render(
      <DataTable<Item>
        columns={columns}
        data={data}
        renderExpandedRow={(row) => <div>Detalles de {row.name}</div>}
      />,
    )
    expect(screen.queryByText('Detalles de Ana')).not.toBeInTheDocument()
  })

  it('muestra el contenido expandido al hacer click en el toggle', async () => {
    const user = userEvent.setup()
    render(
      <DataTable<Item>
        columns={columns}
        data={data}
        renderExpandedRow={(row) => <div>Detalles de {row.name}</div>}
      />,
    )
    const expandButtons = screen.getAllByLabelText('Expandir fila')
    await user.click(expandButtons[0])
    expect(screen.getByText('Detalles de Ana')).toBeInTheDocument()
  })

  it('alterna el estado expandido cuando se hace click nuevamente', async () => {
    const user = userEvent.setup()
    render(
      <DataTable<Item>
        columns={columns}
        data={data}
        renderExpandedRow={(row) => <div>Detalles de {row.name}</div>}
      />,
    )
    const expandButton = screen.getAllByLabelText('Expandir fila')[0]
    await user.click(expandButton)
    expect(screen.getByText('Detalles de Ana')).toBeInTheDocument()

    const collapseButton = screen.getByLabelText('Colapsar fila')
    await user.click(collapseButton)
    expect(screen.queryByText('Detalles de Ana')).not.toBeInTheDocument()
  })

  it('no dispara onRowClick cuando se hace click en el botón de expansión', async () => {
    const user = userEvent.setup()
    const onRowClick = vi.fn()
    render(
      <DataTable<Item>
        columns={columns}
        data={data}
        onRowClick={onRowClick}
        renderExpandedRow={(row) => <div>Detalles de {row.name}</div>}
      />,
    )
    const expandButtons = screen.getAllByLabelText('Expandir fila')
    await user.click(expandButtons[0])
    expect(onRowClick).not.toHaveBeenCalled()
  })

  it('oculta el botón de expansión para filas donde getRowCanExpand devuelve false', () => {
    render(
      <DataTable<Item>
        columns={columns}
        data={data}
        renderExpandedRow={(row) => <div>Detalles de {row.name}</div>}
        getRowCanExpand={(row) => row.id !== 2}
      />,
    )
    const expandButtons = screen.getAllByLabelText('Expandir fila')
    expect(expandButtons).toHaveLength(2)
  })

  it('permite expandir múltiples filas simultáneamente', async () => {
    const user = userEvent.setup()
    render(
      <DataTable<Item>
        columns={columns}
        data={data}
        renderExpandedRow={(row) => <div>Detalles de {row.name}</div>}
      />,
    )
    let expandButtons = screen.getAllByLabelText('Expandir fila')
    await user.click(expandButtons[0])
    expandButtons = screen.getAllByLabelText('Expandir fila')
    await user.click(expandButtons[0])
    expect(screen.getByText('Detalles de Ana')).toBeInTheDocument()
    expect(screen.getByText('Detalles de Beto')).toBeInTheDocument()
  })
})

describe('DataTable - modo servidor', () => {
  it('muestra la página que define la pantalla, también si un filtro externo vuelve a la primera', async () => {
    const user = userEvent.setup()
    const fetchData = vi.fn()
    render(<TablaServidor fetchData={fetchData} />)

    await user.click(screen.getByRole('button', { name: 'Página 3' }))

    expect(fetchData).toHaveBeenLastCalledWith(expect.objectContaining({ page: 3 }))
    expect(screen.getByRole('button', { name: 'Página 3' })).toHaveAttribute('aria-current', 'page')

    await user.click(screen.getByRole('button', { name: 'Aplicar filtro' }))

    expect(fetchData).toHaveBeenLastCalledWith(expect.objectContaining({ page: 1 }))
    expect(screen.getByRole('button', { name: 'Página 1' })).toHaveAttribute('aria-current', 'page')
  })

  it('vuelve a la primera página al buscar con una sola consulta', async () => {
    const user = userEvent.setup()
    const fetchData = vi.fn()
    render(<TablaServidor fetchData={fetchData} paginaInicial={3} />)
    fetchData.mockClear()

    await user.click(screen.getByRole('searchbox', { name: 'Buscar en la tabla' }))
    await user.paste('ana')

    await waitFor(() => expect(fetchData).toHaveBeenCalled())
    expect(fetchData).toHaveBeenCalledTimes(1)
    expect(fetchData).toHaveBeenCalledWith(expect.objectContaining({ page: 1, searchTerm: 'ana' }))
  })

  it('pide la última página válida cuando la actual deja de existir', async () => {
    render(<TablaServidor paginaInicial={3} totalRows={15} filas={[]} />)

    expect(await screen.findByRole('button', { name: 'Página 2' })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  it('mantiene la paginación visible aunque la página actual venga sin filas', () => {
    render(<TablaServidor filas={[]} />)

    expect(screen.getByRole('button', { name: 'Página 1' })).toBeInTheDocument()
  })

  it('ordena con el botón del encabezado y marca solo la columna ordenada', async () => {
    const user = userEvent.setup()
    const fetchData = vi.fn()
    render(<TablaServidor fetchData={fetchData} />)

    await user.click(screen.getByRole('button', { name: 'Nombre' }))

    expect(screen.getByRole('columnheader', { name: 'Nombre' })).toHaveAttribute(
      'aria-sort',
      'ascending',
    )
    expect(screen.getByRole('columnheader', { name: 'ID' })).not.toHaveAttribute('aria-sort')
    expect(fetchData).toHaveBeenLastCalledWith(
      expect.objectContaining({ sortField: 'name', sortDirection: 'asc' }),
    )
  })

  it('da nombre accesible a la tabla', () => {
    render(<TablaServidor />)

    expect(screen.getByRole('table', { name: 'Personas' })).toBeInTheDocument()
  })

  it('ofrece exportar solo si la pantalla entrega onExport', () => {
    const { rerender } = render(
      <DataTable<Item> columns={columns} data={data} apiMode exportable totalRows={3} />,
    )

    expect(screen.queryByRole('button', { name: 'Exportar' })).not.toBeInTheDocument()

    rerender(
      <DataTable<Item>
        columns={columns}
        data={data}
        apiMode
        exportable
        totalRows={3}
        onExport={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: 'Exportar' })).toBeInTheDocument()
  })
})

describe('DataTable - menú de acciones', () => {
  const renderizarConMenu = (onEliminar = vi.fn()) => {
    const actions: RowAction<Item>[] = [
      { key: 'ver', label: 'Ver', icon: <Eye size={16} />, onClick: vi.fn() },
      { key: 'editar', label: 'Editar', icon: <Eye size={16} />, onClick: vi.fn() },
      { key: 'eliminar', label: 'Eliminar', icon: <Eye size={16} />, onClick: onEliminar },
    ]

    render(
      <DataTable<Item>
        columns={columns}
        data={[data[0]]}
        actions={actions}
        maxVisibleActions={1}
      />,
    )
  }

  it('expone un menú y devuelve el foco al botón al cerrarlo con Escape', async () => {
    const user = userEvent.setup()
    renderizarConMenu()
    const boton = screen.getByRole('button', { name: 'Más opciones' })

    await user.click(boton)

    expect(await screen.findByRole('menu')).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Eliminar' })).toBeInTheDocument()

    await user.keyboard('{Escape}')

    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())
    await waitFor(() => expect(boton).toHaveFocus())
  })

  it('ejecuta la acción elegida y cierra el menú', async () => {
    const user = userEvent.setup()
    const onEliminar = vi.fn()
    renderizarConMenu(onEliminar)

    await user.click(screen.getByRole('button', { name: 'Más opciones' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Eliminar' }))

    expect(onEliminar).toHaveBeenCalledWith(data[0])
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())
  })
})
