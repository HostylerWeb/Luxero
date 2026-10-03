"use client";

import {
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  type PaginationState,
  type Table as ReactTable,
  type RowSelectionState,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  ChevronsUpDown,
  EyeOff,
  Search,
} from "lucide-react";
import * as React from "react";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "./ui/empty";
import { Input } from "./ui/input";
import { Skeleton } from "./ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";

export interface DataTableFacetedFilter<TData> {
  column: keyof TData | string;
  title: string;
  options: { label: string; value: string; icon?: React.ComponentType<{ className?: string }> }[];
}

export interface DataTableProps<TData, TValue = unknown> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageCount?: number;
  pagination?: PaginationState;
  onPaginationChange?: React.Dispatch<React.SetStateAction<PaginationState>>;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  enableRowSelection?: boolean;
  enableColumnVisibility?: boolean;
  toolbar?: React.ReactNode;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  faceted?: DataTableFacetedFilter<TData>[];
  getRowId?: (row: TData) => string;
  className?: string;
  rowClassName?: (row: TData) => string | undefined;
  onRowClick?: (row: TData) => void;
}

export function DataTable<TData, TValue = unknown>({
  columns,
  data,
  pageCount = -1,
  pagination,
  onPaginationChange,
  isLoading = false,
  emptyTitle = "No results",
  emptyDescription = "No records to display.",
  enableRowSelection = false,
  enableColumnVisibility = true,
  toolbar,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  faceted,
  getRowId,
  className,
  rowClassName,
  onRowClick,
}: DataTableProps<TData, TValue>) {
  const { t } = useTranslation();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  const finalColumns = React.useMemo<ColumnDef<TData, TValue>[]>(() => {
    if (!enableRowSelection) return columns;
    const selectionColumn: ColumnDef<TData, TValue> = {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label={t("common.selectAll")}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label={t("common.selectRow")}
          onClick={(e) => e.stopPropagation()}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    };
    return [selectionColumn, ...columns];
  }, [columns, enableRowSelection, t]);

  const table = useReactTable({
    data,
    columns: finalColumns,
    pageCount,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      ...(pagination ? { pagination } : {}),
    },
    enableRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    manualPagination: !!pagination,
    manualSorting: false,
    getRowId,
  });

  const showSearch = typeof onSearchChange === "function";

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {(showSearch || faceted?.length || enableColumnVisibility || toolbar) && (
        <DataTableToolbar
          table={table}
          searchPlaceholder={searchPlaceholder}
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          faceted={faceted}
          enableColumnVisibility={enableColumnVisibility}
        >
          {toolbar}
        </DataTableToolbar>
      )}

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="border-b border-border bg-muted/30 hover:bg-muted/30"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="h-10 px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({
                  length: Math.min(pagination?.pageSize ?? 5, 8),
                }).map((_row, i) => (
                  <TableRow key={`skeleton-${i}`} className="border-b border-border/60">
                    {finalColumns.map((_col, j) => (
                      <TableCell key={`cell-${i}-${j}`} className="px-4 py-3">
                        <Skeleton
                          className={cn("h-5 w-full max-w-[120px]", j === 0 && "max-w-[200px]")}
                          shimmer
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={finalColumns.length}
                    className="border-t border-dashed border-border/60 py-0"
                  >
                    <Empty>
                      <EmptyHeader>
                        <EmptyTitle>{emptyTitle}</EmptyTitle>
                        <EmptyDescription>{emptyDescription}</EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                    className={cn(
                      "group/row border-b border-border/60 transition-colors hover:bg-muted/40 data-[state=selected]:bg-primary/5",
                      onRowClick && "cursor-pointer",
                      rowClassName?.(row.original)
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="px-4 py-3 align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {!isLoading && table.getRowModel().rows.length > 0 && pagination ? (
          <DataTablePagination table={table} />
        ) : null}
      </div>
    </div>
  );
}

// ---------- Toolbar ----------

interface DataTableToolbarProps<TData> {
  table: ReactTable<TData>;
  children?: React.ReactNode;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  faceted?: DataTableFacetedFilter<TData>[];
  enableColumnVisibility?: boolean;
}

function DataTableToolbar<TData>({
  table,
  children,
  searchPlaceholder = "Search…",
  searchValue,
  onSearchChange,
  faceted,
  enableColumnVisibility,
}: DataTableToolbarProps<TData>) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {onSearchChange ? (
        <div className="relative min-w-[220px] flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchValue ?? ""}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-9 pl-8"
          />
        </div>
      ) : null}

      {faceted?.map((filter) => {
        const column = table.getColumn(String(filter.column));
        if (!column) return null;
        return (
          <DataTableFacetedFilterMenu
            key={String(filter.column)}
            column={column}
            title={filter.title}
            options={filter.options}
          />
        );
      })}

      <div className="ml-auto flex items-center gap-2">
        {children}
        {enableColumnVisibility ? <DataTableViewOptions table={table} /> : null}
      </div>
    </div>
  );
}

// ---------- Faceted Filter ----------

interface FacetedFilterMenuProps<TData, TValue> {
  column: Column<TData, TValue>;
  title: string;
  options: { label: string; value: string; icon?: React.ComponentType<{ className?: string }> }[];
}

function DataTableFacetedFilterMenu<TData, TValue>({
  column,
  title,
  options,
}: FacetedFilterMenuProps<TData, TValue>) {
  const selectedValues = new Set(column.getFilterValue() as string[]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 border-dashed gap-1.5">
          {title}
          {selectedValues.size > 0 ? (
            <span className="ml-1 rounded-sm bg-primary/15 px-1.5 py-0.5 text-xs font-medium text-primary">
              {selectedValues.size}
            </span>
          ) : null}
          <ChevronDown className="size-3.5 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>{title}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map((option) => {
          const isSelected = selectedValues.has(option.value);
          return (
            <DropdownMenuItem
              key={option.value}
              onSelect={(e) => {
                e.preventDefault();
                if (isSelected) selectedValues.delete(option.value);
                else selectedValues.add(option.value);
                const filterValues = Array.from(selectedValues);
                column.setFilterValue(filterValues.length ? filterValues : undefined);
              }}
            >
              <Checkbox checked={isSelected} className="mr-2 size-4" onCheckedChange={() => {}} />
              {option.icon ? <option.icon className="mr-2 size-4 text-muted-foreground" /> : null}
              <span>{option.label}</span>
            </DropdownMenuItem>
          );
        })}
        {selectedValues.size > 0 ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => column.setFilterValue(undefined)}
              className="justify-center text-center text-sm"
            >
              Clear filters
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ---------- View Options ----------

interface DataTableViewOptionsProps<TData> {
  table: ReactTable<TData>;
}

function DataTableViewOptions<TData>({ table }: DataTableViewOptionsProps<TData>) {
  const columns = table
    .getAllColumns()
    .filter((column) => typeof column.accessorFn !== "undefined" && column.getCanHide());
  if (columns.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 gap-1.5">
          <EyeOff className="size-3.5 opacity-60" />
          View
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {columns.map((column) => (
          <DropdownMenuItem
            key={column.id}
            onSelect={(e) => {
              e.preventDefault();
              column.toggleVisibility(!column.getIsVisible());
            }}
          >
            <Checkbox
              checked={column.getIsVisible()}
              className="mr-2 size-4"
              onCheckedChange={() => {}}
            />
            <span className="capitalize">{column.id}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ---------- Pagination ----------

interface DataTablePaginationProps<TData> {
  table: ReactTable<TData>;
}

function DataTablePagination<TData>({ table }: DataTablePaginationProps<TData>) {
  const { t } = useTranslation();
  const { pageIndex } = table.getState().pagination;
  const pageCount = table.getPageCount();

  return (
    <div className="flex items-center justify-between border-t border-border/70 px-4 py-3">
      <span className="text-xs text-muted-foreground">
        Page <strong className="text-foreground">{pageIndex + 1}</strong>{" "}
        {pageCount > 0 ? (
          <>
            of <strong className="text-foreground">{pageCount}</strong>
          </>
        ) : null}
      </span>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
          aria-label={t("common.firstPage")}
        >
          <ChevronsLeft className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          aria-label={t("common.previousPage")}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          aria-label={t("common.nextPage")}
        >
          <ArrowRight className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => table.setPageIndex(pageCount - 1)}
          disabled={!table.getCanNextPage()}
          aria-label={t("common.lastPage")}
        >
          <ChevronsRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

// ---------- Column Header (sortable) ----------

interface DataTableColumnHeaderProps<TData, TValue> extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      className={cn(
        "-ml-2 h-8 gap-1.5 px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground",
        className
      )}
    >
      <span>{title}</span>
      {column.getIsSorted() === "desc" ? (
        <ArrowDown className="size-3.5" />
      ) : column.getIsSorted() === "asc" ? (
        <ArrowUp className="size-3.5" />
      ) : (
        <ChevronsUpDown className="size-3.5 opacity-50" />
      )}
    </Button>
  );
}

export { DataTablePagination, DataTableToolbar, DataTableViewOptions };
