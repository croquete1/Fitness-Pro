"use client";

import * as React from "react";
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

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
      rowSelection,
    },
    initialState: {
      pagination: { pageSize: initialPageSize },
    },
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
    <div className="space-y-3">
      {/* Filtro global */}
      <div className="flex items-center gap-2">
        <input
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder={globalFilterPlaceholder}
          className="w-full max-w-xs rounded-md border px-3 py-2"
        />
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full border-collapse">
          <thead className="bg-card">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sortDir = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      className="select-none border-b px-3 py-2 text-left text-sm font-semibold"
                    >
                      {canSort ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="inline-flex items-center gap-1"
                          aria-label="Ordenar"
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          <span className="text-xs opacity-60">
                            {sortDir === "asc" ? "▲" : sortDir === "desc" ? "▼" : ""}
                          </span>
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}

                      {/* Filtro por coluna (opcional) */}
                      {header.column.getCanFilter() && (
                        <div className="mt-1">
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
              <tr key={row.id} className="odd:bg-transparent even:bg-black/5 dark:even:bg-white/5">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="border-b px-3 py-2 text-sm">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}

            {table.getRowModel().rows.length === 0 && (
              <tr>
                <td colSpan={table.getAllColumns().length} className="px-3 py-6 text-center text-sm opacity-70">
                  Sem resultados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm opacity-80">
          Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()} &nbsp;•&nbsp;{" "}
          {table.getFilteredRowModel().rows.length} registo(s)
        </div>
        <div className="flex items-center gap-2">
          <button
            className="rounded-md border px-2 py-1 text-sm disabled:opacity-50"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            «
          </button>
          <button
            className="rounded-md border px-2 py-1 text-sm disabled:opacity-50"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            ‹
          </button>
          <button
            className="rounded-md border px-2 py-1 text-sm disabled:opacity-50"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            ›
          </button>
          <button
            className="rounded-md border px-2 py-1 text-sm disabled:opacity-50"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            »
          </button>
          <select
            className="rounded-md border px-2 py-1 text-sm"
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
          >
            {[5, 10, 20, 50].map((ps) => (
              <option key={ps} value={ps}>
                {ps} / página
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

/** Input simples para filtro por coluna (genérico e bem tipado) */
function ColumnFilter<TData, TValue>({ column }: { column: Column<TData, TValue> }) {
  // Primeiro valor faceteado ajuda-nos a inferir se é numérico
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
        className="w-24 rounded-md border px-2 py-1 text-xs"
        placeholder="Filtrar…"
      />
    );
  }

  return (
    <input
      value={(value as string | undefined) ?? ""}
      onChange={(e) => column.setFilterValue(e.target.value)}
      className="w-36 rounded-md border px-2 py-1 text-xs"
      placeholder="Filtrar…"
    />
  );
}
