import { ChevronUp, ChevronDown } from 'lucide-react';
import { clsx } from '../../utils/helpers';

export default function Table({ 
  columns, 
  data, 
  onSort,
  sortColumn,
  sortDirection,
  className 
}) {
  const handleSort = (column) => {
    if (onSort && column.sortable) {
      onSort(column.key);
    }
  };

  return (
    <div className={clsx('overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg', className)}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-300 table-fixed">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={clsx(
                  'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                  column.sortable && 'cursor-pointer hover:bg-gray-100',
                  column.className
                )}
                onClick={() => handleSort(column)}
              >
                <div className="flex items-center gap-1">
                  {column.title}
                  {column.sortable && (
                    <div className="flex flex-col">
                      <ChevronUp 
                        className={clsx(
                          'h-3 w-3',
                          sortColumn === column.key && sortDirection === 'asc' 
                            ? 'text-gray-900' 
                            : 'text-gray-400'
                        )} 
                      />
                      <ChevronDown 
                        className={clsx(
                          'h-3 w-3 -mt-1',
                          sortColumn === column.key && sortDirection === 'desc' 
                            ? 'text-gray-900' 
                            : 'text-gray-400'
                        )} 
                      />
                    </div>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, index) => (
            <tr key={row.id || index} className="hover:bg-gray-50">
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={clsx(
                    'px-6 py-4 text-sm text-gray-900',
                    column.key === 'actions' ? 'whitespace-nowrap' : '',
                    column.cellClassName
                  )}
                >
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        </table>
      </div>

      {data.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Aucune donnée disponible</p>
        </div>
      )}
    </div>
  );
}
