import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import { HiChevronUp, HiChevronDown, HiSearch } from "react-icons/hi";

const DataTable = ({
  data,
  columns,
  searchable = true,
  searchPlaceholder = "Search...",
  pageSize = 10,
}) => {
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });

  return (
    <div className='space-y-4'>
      {/* Search */}
      {searchable && (
        <div className='relative'>
          <HiSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-text/40' />
          <input
            type='text'
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder={searchPlaceholder}
            className='input pl-10'
          />
        </div>
      )}

      {/* Table */}
      <div className='card overflow-x-auto'>
        <table className='w-full'>
          <thead className='bg-secondary-surface'>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className='px-4 py-3 text-left text-sm font-medium text-text'
                    style={{ width: header.getSize() }}>
                    {header.isPlaceholder ? null : (
                      <div
                        className={`flex items-center gap-2 ${
                          header.column.getCanSort()
                            ? "cursor-pointer select-none hover:text-primary"
                            : ""
                        }`}
                        onClick={header.column.getToggleSortingHandler()}>
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: <HiChevronUp className='text-primary' />,
                          desc: <HiChevronDown className='text-primary' />,
                        }[header.column.getIsSorted()] ?? null}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className='divide-y divide-secondary-surface'>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className='px-4 py-8 text-center text-text/60'>
                  No data found
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className='hover:bg-secondary-surface/50 transition-colors'>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className='px-4 py-3 text-sm text-text'>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className='flex items-center justify-between text-sm'>
        <div className='text-text/60'>
          Showing {table.getState().pagination.pageIndex * pageSize + 1} to{" "}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * pageSize,
            table.getFilteredRowModel().rows.length
          )}{" "}
          of {table.getFilteredRowModel().rows.length} results
        </div>
        <div className='flex items-center gap-2'>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className='btn px-3 py-1.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed'>
            Previous
          </button>
          <span className='text-text'>
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </span>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className='btn px-3 py-1.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed'>
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
