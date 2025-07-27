// src/components/dashboard/DataTable.tsx
import React from 'react';
import {
  useTable,
  Column,
  TableInstance,
  Row,
} from 'react-table';

interface DataTableProps<T extends object> {
  columns: Column<T>[];
  data: T[];
}

export default function DataTable<T extends object>({
  columns,
  data,
}: DataTableProps<T>) {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  }: TableInstance<T> = useTable({ columns, data });

  return (
    <table
      {...getTableProps()}
      className="min-w-full bg-white rounded shadow"
    >
      <thead>
        {headerGroups.map(headerGroup => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map(col => (
              <th
                {...col.getHeaderProps()}
                className="px-4 py-2 text-left text-sm font-medium text-gray-600"
              >
                {col.render('Header')}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row: Row<T>) => {
          prepareRow(row);
          return (
            <tr {...row.getRowProps()} className="border-t">
              {row.cells.map(cell => (
                <td
                  {...cell.getCellProps()}
                  className="px-4 py-2 text-sm text-gray-700"
                >
                  {cell.render('Cell')}
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
