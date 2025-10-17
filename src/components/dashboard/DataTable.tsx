"use client";

import * as React from "react";
import Button from "@/components/ui/Button";
import {
  ColumnDef,
  Column,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  useReactTable,
} from "@tanstack/react-table";

type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  initialPageSize?: number;
  globalFilterPlaceholder?: string;
};

export default function DataTable<TData, TValue>({
  columns,
  data,
  initialPageSize = 10,
  globalFilterPlaceholder = "Pesquisar…",
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const deferredGlobalFilter = React.useDeferredValue(globalFilter);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter: deferredGlobalFilter,
      columnVisibility,
      rowSelection,
    },
    initialState: { pagination: { pageSize: initialPageSize } },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <section className="neo-panel space-y-5" aria-label="Tabela de dados">
      <div className="neo-panel__actions neo-panel__actions--table">
        <label className="neo-input-group__field">
          <span className="neo-input-group__label">Pesquisar</span>
          <input
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder={globalFilterPlaceholder}
            className="neo-input"
            type="search"
            aria-label="Filtrar resultados"
          />
        </label>
      </div>

      <div className="neo-table-wrapper">
        <table className="neo-table">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sortDir = header.column.getIsSorted();
                  return (
                    <th key={header.id}>
                      {canSort ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="neo-table__sort"
                          aria-label="Ordenar coluna"
                        >
                          <span className="neo-table__label">
                            {flexRender(header.column.columnDef.header, header.getContext())}
                          </span>
                          <span aria-hidden="true">
                            {sortDir === "asc" ? "▲" : sortDir === "desc" ? "▼" : ""}
                          </span>
                        </button>
                      ) : (
                        <span className="neo-table__label">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </span>
                      )}

                      {header.column.getCanFilter() && (
                        <div className="neo-table__filter">
                          <ColumnFilter column={header.column} />
                        </div>
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>

          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                ))}
              </tr>
            ))}

            {table.getRowModel().rows.length === 0 && (
              <tr>
                <td colSpan={table.getAllColumns().length}>
                  <div className="neo-empty">
                    <span className="neo-empty__icon" aria-hidden="true">
                      📭
                    </span>
                    <p className="neo-empty__title">Sem resultados</p>
                    <p className="neo-empty__description">
                      Ajusta filtros ou pesquisa para encontrar novos registos.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <footer className="neo-pagination" aria-label="Paginação">
        <div className="neo-pagination__summary">
          Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()} ·{' '}
          {table.getFilteredRowModel().rows.length} registo(s)
        </div>
        <div className="neo-pagination__controls">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            aria-label="Primeira página"
          >
            «
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="Página anterior"
          >
            ‹
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label="Próxima página"
          >
            ›
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            aria-label="Última página"
          >
            »
          </Button>
          <label className="neo-input-group__field neo-pagination__pageSize">
            <span className="neo-input-group__label">Linhas</span>
            <select
              className="neo-input"
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              aria-label="Selecionar linhas por página"
            >
              {[5, 10, 20, 50].map((ps) => (
                <option key={ps} value={ps}>
                  {ps} / página
                </option>
              ))}
            </select>
          </label>
        </div>
      </footer>
    </section>
  );
}

function ColumnFilter<TData, TValue>({ column }: { column: Column<TData, TValue> }) {
  const firstValue = column.getFacetedRowModel()?.flatRows[0]?.getValue(column.id) as unknown;
  const isNumber = typeof firstValue === "number";
  const value = column.getFilterValue();

  if (isNumber) {
    return (
      <input
        type="number"
        value={(value as number | undefined) ?? ""}
        onChange={(e) =>
          column.setFilterValue(e.target.value ? Number(e.target.value) : undefined)
        }
        className="neo-input neo-input--compact"
        placeholder="Filtrar…"
      />
    );
  }

  return (
    <input
      value={(value as string | undefined) ?? ""}
      onChange={(e) => column.setFilterValue(e.target.value)}
      className="neo-input neo-input--compact"
      placeholder="Filtrar…"
    />
  );
}
