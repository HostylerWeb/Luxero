import { useSearchParams } from "next/navigation";
import { useCallback } from "react";

export interface TableSortState {
  sortField: string;
  sortDir: "asc" | "desc";
}

export function useTableSort(defaultField = "createdAt", defaultDir: "asc" | "desc" = "desc") {
  const searchParams = useSearchParams();

  const sortField = searchParams.get("sortField") ?? defaultField;
  const sortDir = (searchParams.get("sortDir") as "asc" | "desc") ?? defaultDir;

  const toggleSort = useCallback(
    (field: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const prevField = params.get("sortField") ?? defaultField;
      const prevDir = (params.get("sortDir") as "asc" | "desc") ?? defaultDir;
      const nextField = field;
      const nextDir: "asc" | "desc" =
        prevField === field ? (prevDir === "asc" ? "desc" : "asc") : "asc";
      if (nextField === defaultField && nextDir === defaultDir) {
        params.delete("sortField");
        params.delete("sortDir");
      } else {
        params.set("sortField", nextField);
        params.set("sortDir", nextDir);
      }
    },
    [searchParams, defaultField, defaultDir]
  );

  const resetSort = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("sortField");
    params.delete("sortDir");
  }, [searchParams]);

  return { sortField, sortDir, toggleSort, resetSort };
}
