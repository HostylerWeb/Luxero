import type { Column } from "@tanstack/react-table";
import { Skeleton } from "./ui/skeleton";

interface LoadingRowProps {
  columns: Column<unknown, unknown>[];
  rowCount?: number;
}

function LoadingRow({ columns, rowCount = 5 }: LoadingRowProps) {
  return (
    <>
      {Array.from({ length: rowCount }).map((_, rowIndex) => (
        <tr key={rowIndex} className="border-b border-gold/10">
          {columns.map((column) => (
            <td key={column.id} className="p-4">
              <Skeleton className="h-5 w-full max-w-[120px]" shimmer />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export { LoadingRow };
