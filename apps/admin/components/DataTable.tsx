"use client";

import {
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  type ExpandedState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getGroupedRowModel,
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
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronsUpDown,
  Download,
  EyeOff,
  Search,
} from "lucide-react";
import * as React from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Skeleton } from "./ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";

export interface DataTableFacetedFilter<TData> {
  column: keyof TData | string;
  title: string;
  options: { label: string; value: string; icon?: React.ComponentType<{ className?: string }> }[];
}

export interface BulkAction {
  label: string;
  onClick: (selectedIds: string[]) => void;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost";
  disabled?: boolean;
  requiresSelection?: boolean;
  umamiEvent?: string;
}

export interface DataTableProps<TData, TValue = unknown> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageCount?: number;
  pagination?: PaginationState;
  onPaginationChange?: React.Dispatch<React.SetStateAction<PaginationState>>;
  manualSorting?: boolean;
  sorting?: SortingState;
  onSortingChange?: React.Dispatch<React.SetStateAction<SortingState>>;
  columnVisibility?: VisibilityState;
  onColumnVisibilityChange?: React.Dispatch<React.SetStateAction<VisibilityState>>;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  enableRowSelection?: boolean;
  onSelectedRowsChange?: (rows: TData[]) => void;
  bulkActions?: BulkAction[];
  enableColumnVisibility?: boolean;
  toolbar?: React.ReactNode;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchEvent?: string;
  faceted?: DataTableFacetedFilter<TData>[];
  exportConfig?: {
    onExport: () => void;
    isExporting?: boolean;
    label?: string;
    umamiEvent?: string;
  };
  getRowId?: (row: TData) => string;
  className?: string;
  rowClassName?: (row: TData) => string | undefined;
  onRowClick?: (row: TData) => void;
  enableGrouping?: boolean;
  grouping?: string[];
  onGroupingChange?: React.Dispatch<React.SetStateAction<string[]>>;
}

export function DataTable<TData, TValue = unknown>({
  columns,
  data,
  pageCount = -1,
  pagination,
  onPaginationChange,
  manualSorting = false,
  sorting,
  onSortingChange,
  columnVisibility,
  onColumnVisibilityChange,
  isLoading = false,
  emptyTitle = "No results",
  emptyDescription = "No records to display.",
  enableRowSelection = false,
  onSelectedRowsChange,
  bulkActions,
  enableColumnVisibility = true,
  toolbar,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  searchEvent,
  faceted,
  exportConfig,
  getRowId,
  className,
  rowClassName,
  onRowClick,
  enableGrouping = false,
  grouping,
  onGroupingChange,
}: DataTableProps<TData, TValue>) {
  const [internalSorting, setInternalSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [internalColumnVisibility, setInternalColumnVisibility] = React.useState<VisibilityState>(
    {}
  );
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [internalGrouping, setInternalGrouping] = React.useState<string[]>([]);
  const [expanded, setExpanded] = React.useState<ExpandedState>({});

  const selectedCount = Object.keys(rowSelection).length;
  const effectiveGrouping = enableGrouping ? (grouping ?? internalGrouping) : [];
  const handleGroupingChange = onGroupingChange ?? setInternalGrouping;

  const effectiveSorting = manualSorting ? (sorting ?? []) : internalSorting;
  const handleSortingChange = manualSorting
    ? (onSortingChange ?? setInternalSorting)
    : setInternalSorting;
  const effectiveColumnVisibility = columnVisibility ?? internalColumnVisibility;
  const handleColumnVisibilityChange = onColumnVisibilityChange ?? setInternalColumnVisibility;

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
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          onClick={(e) => e.stopPropagation()}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    };
    return [selectionColumn, ...columns];
  }, [columns, enableRowSelection]);

  const table = useReactTable({
    data,
    columns: finalColumns,
    pageCount,
    state: {
      sorting: effectiveSorting,
      columnFilters,
      columnVisibility: effectiveColumnVisibility,
      rowSelection,
      grouping: effectiveGrouping,
      expanded,
      ...(pagination ? { pagination } : {}),
    },
    enableRowSelection,
    onSortingChange: handleSortingChange,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: handleColumnVisibilityChange,
    onRowSelectionChange: setRowSelection,
    onGroupingChange: handleGroupingChange,
    onExpandedChange: setExpanded,
    onPaginationChange,
    getCoreRowModel: getCoreRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    ...(manualSorting ? {} : { getSortedRowModel: getSortedRowModel() }),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    manualPagination: !!pagination,
    manualSorting,
    getRowId,
  });

  React.useEffect(() => {
    if (!onSelectedRowsChange) return;
    const selectedRows = table.getSelectedRowModel().flatRows.map((r) => r.original);
    onSelectedRowsChange(selectedRows);
  }, [rowSelection, onSelectedRowsChange, table]);

  const showSearch = typeof onSearchChange === "function";

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {(showSearch || faceted?.length || enableColumnVisibility || toolbar) && (
        <DataTableToolbar
          table={table}
          searchPlaceholder={searchPlaceholder}
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          searchEvent={searchEvent}
          faceted={faceted}
          enableColumnVisibility={enableColumnVisibility}
          exportConfig={exportConfig}
        >
          {toolbar}
        </DataTableToolbar>
      )}

      {bulkActions && selectedCount > 0 ? (
        <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-lg border">
          <span className="text-sm text-muted-foreground font-medium whitespace-nowrap">
            {selectedCount} selected
          </span>
          <div className="flex gap-1">
            {bulkActions.map((action) => (
              <Button
                key={action.label}
                variant={action.variant ?? "outline"}
                size="sm"
                onClick={() => {
                  const selectedIds = table.getSelectedRowModel().flatRows.map((r) => {
                    const id = r.id ?? (r.original as any)._id ?? (r.original as any).id;
                    return String(id);
                  });
                  action.onClick(selectedIds);
                }}
                disabled={action.disabled}
                {...(action.umamiEvent ? { "data-umami-event": action.umamiEvent } : {})}
              >
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      ) : null}

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
                table.getRowModel().rows.map((row) => {
                  const isGroupRow = row.getIsGrouped();
                  if (isGroupRow) {
                    return (
                      <TableRow
                        key={row.id}
                        className="border-b border-border/80 bg-muted/20 hover:bg-muted/20"
                      >
                        {row.getVisibleCells().map((cell) => {
                          if (cell.getIsGrouped()) {
                            return (
                              <TableCell
                                key={cell.id}
                                className="whitespace-nowrap px-4 py-2 text-xs font-semibold tracking-wide text-muted-foreground"
                              >
                                <button
                                  type="button"
                                  onClick={() => row.toggleExpanded()}
                                  className="mr-1.5 inline-flex items-center align-middle"
                                >
                                  {row.getIsExpanded() ? (
                                    <ChevronDown className="size-3.5" />
                                  ) : (
                                    <ChevronRight className="size-3.5" />
                                  )}
                                </button>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                <span className="ml-2 rounded-sm bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                                  {row.subRows.length}
                                </span>
                              </TableCell>
                            );
                          }
                          if (cell.getIsPlaceholder()) {
                            return <TableCell key={cell.id} className="px-4 py-2" />;
                          }
                          return (
                            <TableCell key={cell.id} className="px-4 py-2">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  }
                  return (
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
                  );
                })
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
  searchEvent?: string;
  faceted?: DataTableFacetedFilter<TData>[];
  enableColumnVisibility?: boolean;
  exportConfig?: {
    onExport: () => void;
    isExporting?: boolean;
    label?: string;
    umamiEvent?: string;
  };
}

function DataTableToolbar<TData>({
  table,
  children,
  searchPlaceholder = "Search\u2026",
  searchValue,
  onSearchChange,
  searchEvent,
  faceted,
  enableColumnVisibility,
  exportConfig,
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
            {...(searchEvent ? { "data-umami-event": searchEvent } : {})}
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
        {exportConfig ? (
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1.5"
            onClick={exportConfig.onExport}
            disabled={exportConfig.isExporting}
            {...(exportConfig.umamiEvent ? { "data-umami-event": exportConfig.umamiEvent } : {})}
          >
            <Download className="size-3.5 opacity-60" />
            {exportConfig.label ?? "Export CSV"}
          </Button>
        ) : null}
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
  const { pageIndex, pageSize } = table.getState().pagination;
  const pageCount = table.getPageCount();

  return (
    <div className="flex items-center justify-between border-t border-border/70 px-4 py-3">
      <div className="flex items-center gap-2">
        <p className="text-sm text-muted-foreground whitespace-nowrap">Rows per page</p>
        <Select value={String(pageSize)} onValueChange={(v) => table.setPageSize(Number(v))}>
          <SelectTrigger className="h-8 w-[70px]">
            <SelectValue placeholder={pageSize} />
          </SelectTrigger>
          <SelectContent>
            {[5, 10, 20, 50, 100].map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-4">
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
            aria-label="First page"
          >
            <ChevronsLeft className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="Previous page"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label="Next page"
          >
            <ArrowRight className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => table.setPageIndex(pageCount - 1)}
            disabled={!table.getCanNextPage()}
            aria-label="Last page"
          >
            <ChevronsRight className="size-4" />
          </Button>
        </div>
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
