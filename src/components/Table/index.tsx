import { ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

type Column = {
  field: string
  headerName: string
  className?: string
  renderCell?: (fieldValue: any, fieldsValue: any) => ReactNode
}

type Row = any

type TableProps = {
  columns: Column[]
  rows: Row[]
}

const Table = ({ columns, rows }: TableProps) => {
  return (
    <table className="table-auto">
      <thead>
        <tr>
          {columns.length > 0
            ? columns.map((column, ci: number) => (
                <th key={`column-${ci}`}>{column.headerName}</th>
              ))
            : null}
        </tr>
      </thead>
      <tbody>
        {rows?.length > 0
          ? rows.map((row, ri) => {
              const newRow = columns
                .map((column) => column.field)
                .reduce(
                  (obj, key) => ({
                    ...obj,
                    [key]: row[key],
                  }),
                  {}
                )
              return (
                <tr key={`row-${ri}`} className="odd:bg-white even:bg-gray-100">
                  {Object.entries(newRow).length > 0 &&
                    Object.entries(newRow).map(
                      ([fieldKey, fieldValue]: [string, any], fvi: number) => {
                        const isRank = fieldKey === 'rank'
                        const column = columns.find(
                          (column) => column.field === fieldKey
                        )
                        const className = column?.className
                        const renderCell = column?.renderCell
                        const IsFunction = typeof renderCell === 'function'
                        return (
                          <td
                            className={twMerge(
                              'whitespace-nowrap p-3 text-left',
                              className
                            )}
                            key={`field-value-${fvi}`}
                          >
                            {IsFunction
                              ? renderCell(fieldValue, newRow)
                              : isRank
                              ? ri + 1
                              : fieldValue}
                          </td>
                        )
                      }
                    )}
                </tr>
              )
            })
          : null}
      </tbody>
    </table>
  )
}

export default Table
