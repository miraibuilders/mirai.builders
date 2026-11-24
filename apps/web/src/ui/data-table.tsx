"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Button } from "./button";
import { InlineBanner } from "./banner";
import { EmptyState } from "./empty-state";
import { Input, Select } from "./field";
import { Icon } from "./icons";
import { SkeletonTable } from "./skeleton";
import { useToast } from "./toast";

type SortDirection = "asc" | "desc";
type Density = "default" | "compact";

export interface DataTableColumn<T> {
  id: string;
  header: string;
  cell: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number;
  align?: "left" | "right";
  numeric?: boolean;
  width?: string;
}

export interface DataTableFilter<T> {
  id: string;
  label: string;
  options: { label: string; value: string }[];
  predicate: (row: T, value: string) => boolean;
}

export interface DataTableBulkAction<T> {
  label: string;
  tone?: "primary" | "secondary" | "destructive";
  onAction: (ids: string[], rows: T[]) => void | Promise<void>;
}

export interface DataTableProps<T> {
  rows: T[];
  columns: DataTableColumn<T>[];
  rowId?: (row: T) => string;
  rowAttributes?: (row: T) => Record<string, string>;
  className?: string;
  caption?: string;
  filters?: DataTableFilter<T>[];
  searchPlaceholder?: string;
  getSearchText?: (row: T) => string;
  selectable?: boolean;
  bulkActions?: DataTableBulkAction<T>[];
  pageSizes?: number[];
  defaultPageSize?: number;
  virtualizeAbove?: number;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  emptyState?: { title: string; description: string; action?: ReactNode };
  initialSort?: { id: string; dir: SortDirection } | null;
  densityStorageKey?: string;
  syncUrl?: boolean;
}

function compareValues(a: string | number, b: string | number) {
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), "ja");
}

function readUrlState() {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  return {
    q: params.get("q") ?? "",
    sort: params.get("sort"),
    dir: params.get("dir") as SortDirection | null,
    page: Number(params.get("page") ?? "1"),
    density: params.get("density") as Density | null,
  };
}

export function DataTable<T>({
  rows,
  columns,
  rowId = (row) => (row as { id: string }).id,
  rowAttributes,
  className,
  caption = "Data table",
  filters = [],
  searchPlaceholder = "Search",
  getSearchText,
  selectable = false,
  bulkActions = [],
  pageSizes = [25, 50, 100, 500],
  defaultPageSize = 25,
  virtualizeAbove = 200,
  loading = false,
  error = null,
  onRetry,
  emptyState = { title: "No results", description: "Try changing your search or filters." },
  initialSort = null,
  densityStorageKey = "mirai-ui-table-density",
  syncUrl = false,
}: DataTableProps<T>) {
  const toast = useToast();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [sort, setSort] = useState<{ id: string; dir: SortDirection } | null>(initialSort);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [density, setDensity] = useState<Density>("default");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [scrollTop, setScrollTop] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(densityStorageKey);
    const fromUrl = syncUrl ? readUrlState() : null;
    if (stored === "compact" || stored === "default") setDensity(stored);
    else if (fromUrl?.density === "compact" || fromUrl?.density === "default") setDensity(fromUrl.density);
    if (fromUrl) {
      setSearchInput(fromUrl.q);
      setSearch(fromUrl.q);
      if (fromUrl.sort && fromUrl.dir) setSort({ id: fromUrl.sort, dir: fromUrl.dir });
      if (Number.isFinite(fromUrl.page) && fromUrl.page > 0) setPage(fromUrl.page);
    }
    setHydrated(true);
  }, [densityStorageKey, syncUrl]);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
    setScrollTop(0);
    if (viewportRef.current) viewportRef.current.scrollTop = 0;
  }, [search, filterValues, sort, pageSize]);

  useEffect(() => {
    window.localStorage.setItem(densityStorageKey, density);
  }, [density, densityStorageKey]);

  useEffect(() => {
    if (!syncUrl || !hydrated) return;
    const params = new URLSearchParams(window.location.search);
    if (search) params.set("q", search);
    else params.delete("q");
    if (sort) {
      params.set("sort", sort.id);
      params.set("dir", sort.dir);
    } else {
      params.delete("sort");
      params.delete("dir");
    }
    if (page > 1) params.set("page", String(page));
    else params.delete("page");
    params.set("density", density);
    const query = params.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
  }, [syncUrl, hydrated, search, sort, page, density]);

  const filteredRows = useMemo(() => {
    const needle = search.trim().toLowerCase();
    const result = rows.filter((row) => {
      if (needle) {
        const text = getSearchText ? getSearchText(row) : Object.values(row as object).join(" ");
        if (!String(text).toLowerCase().includes(needle)) return false;
      }
      return filters.every((filter) => {
        const value = filterValues[filter.id];
        return !value || filter.predicate(row, value);
      });
    });
    if (!sort) return result;
    const column = columns.find((item) => item.id === sort.id);
    if (!column?.sortValue) return result;
    return [...result].sort((a, b) => {
      const value = compareValues(column.sortValue!(a), column.sortValue!(b));
      return sort.dir === "asc" ? value : -value;
    });
  }, [rows, filters, filterValues, search, getSearchText, sort, columns]);

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const pageRows = useMemo(
    () => filteredRows.slice((safePage - 1) * pageSize, safePage * pageSize),
    [filteredRows, safePage, pageSize],
  );

  const rowHeight = density === "compact" ? 36 : 48;
  const viewportHeight = 560;
  const virtualized = pageRows.length > virtualizeAbove;
  const startIndex = virtualized ? Math.max(0, Math.floor(scrollTop / rowHeight) - 2) : 0;
  const endIndex = virtualized
    ? Math.min(pageRows.length, startIndex + Math.ceil(viewportHeight / rowHeight) + 6)
    : pageRows.length;
  const visibleRows = virtualized
    ? pageRows.slice(startIndex, endIndex)
    : pageRows;
  const topSpacer = startIndex * rowHeight;
  const bottomSpacer = (pageRows.length - endIndex) * rowHeight;

  const visibleIds = pageRows.map(rowId);
  const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id));

  const toggleSort = useCallback((columnId: string) => {
    setSort((current) => {
      if (current?.id !== columnId) return { id: columnId, dir: "asc" };
      return current.dir === "asc" ? { id: columnId, dir: "desc" } : null;
    });
  }, []);

  const toggleRow = (id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (allSelected) visibleIds.forEach((id) => next.delete(id));
      else visibleIds.forEach((id) => next.add(id));
      return next;
    });
  };

  const runBulkAction = async (action: DataTableBulkAction<T>) => {
    const ids = Array.from(selectedIds);
    const chosen = rows.filter((row) => selectedIds.has(rowId(row)));
    try {
      await action.onAction(ids, chosen);
      setSelectedIds(new Set());
      toast({ tone: "success", title: "Bulk action complete", description: `${ids.length} row(s) updated.` });
    } catch (cause) {
      toast({
        tone: "error",
        title: "Bulk action failed",
        description: cause instanceof Error ? cause.message : "Please try again.",
      });
    }
  };

  return (
    <div className="ui-table-component" data-density={density}>
      <div className="ui-table-toolbar">
        <Input
          className="ui-table-search"
          type="search"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
        />
        {filters.map((filter) => (
          <Select
            key={filter.id}
            aria-label={filter.label}
            value={filterValues[filter.id] ?? ""}
            onChange={(event) =>
              setFilterValues((current) => ({ ...current, [filter.id]: event.target.value }))
            }
          >
            <option value="">All {filter.label.toLowerCase()}</option>
            {filter.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        ))}
        <div className="ui-table-density" role="group" aria-label="Table density">
          <Button
            size="sm"
            variant={density === "default" ? "secondary" : "ghost"}
            aria-pressed={density === "default"}
            onClick={() => setDensity("default")}
          >
            Comfortable
          </Button>
          <Button
            size="sm"
            variant={density === "compact" ? "secondary" : "ghost"}
            aria-pressed={density === "compact"}
            onClick={() => setDensity("compact")}
          >
            Compact
          </Button>
        </div>
      </div>

      {selectable && selectedIds.size > 0 ? (
        <div className="ui-bulk-bar" role="toolbar" aria-label="Bulk actions">
          <span>{selectedIds.size} selected</span>
          {bulkActions.map((action) => (
            <Button
              key={action.label}
              size="sm"
              variant={action.tone ?? "secondary"}
              onClick={() => void runBulkAction(action)}
            >
              {action.label}
            </Button>
          ))}
          <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())}>
            Clear
          </Button>
        </div>
      ) : null}

      {error ? (
        <InlineBanner tone="danger" title="Could not load data">
          {error}
          {onRetry ? (
            <Button size="sm" variant="secondary" onClick={onRetry}>
              Retry
            </Button>
          ) : null}
        </InlineBanner>
      ) : null}

      {loading ? (
        <SkeletonTable rows={8} columns={columns.length + (selectable ? 1 : 0)} />
      ) : filteredRows.length === 0 ? (
        <EmptyState
          title={emptyState.title}
          description={emptyState.description}
          action={emptyState.action}
        />
      ) : (
        <div className="ui-table-viewport" ref={viewportRef} onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}>
          <table className={className ? `ui-table ${className}` : "ui-table"}>
            <caption className="ui-sr-only">{caption}</caption>
            <thead>
              <tr>
                {selectable ? (
                  <th scope="col" className="ui-table-select">
                    <Input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      aria-label="Select all rows on this page"
                    />
                  </th>
                ) : null}
                {columns.map((column) => (
                  <th
                    key={column.id}
                    scope="col"
                    style={{ width: column.width }}
                    aria-sort={
                      column.sortValue
                        ? sort?.id === column.id
                          ? sort.dir === "asc"
                            ? "ascending"
                            : "descending"
                          : "none"
                        : undefined
                    }
                    data-align={column.align ?? "left"}
                  >
                    {column.sortValue ? (
                      <button type="button" className="ui-table-sort" onClick={() => toggleSort(column.id)}>
                        {column.header}
                        <Icon name={sort?.id === column.id && sort.dir === "desc" ? "arrow-down" : "arrow-up"} />
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topSpacer > 0 ? (
                <tr className="ui-table-spacer" aria-hidden="true">
                  <td colSpan={columns.length + (selectable ? 1 : 0)} style={{ height: topSpacer }} />
                </tr>
              ) : null}
              {visibleRows.map((row) => {
                const id = rowId(row);
                return (
                  <tr
                    key={id}
                    {...rowAttributes?.(row)}
                    tabIndex={0}
                    data-selected={selectedIds.has(id) ? "true" : undefined}
                  >
                    {selectable ? (
                      <td className="ui-table-select">
                        <Input
                          type="checkbox"
                          checked={selectedIds.has(id)}
                          onChange={() => toggleRow(id)}
                          aria-label={`Select row ${id}`}
                        />
                      </td>
                    ) : null}
                    {columns.map((column) => (
                      <td key={column.id} data-align={column.align ?? "left"} data-numeric={column.numeric ? "true" : undefined}>
                        {column.cell(row)}
                      </td>
                    ))}
                  </tr>
                );
              })}
              {bottomSpacer > 0 ? (
                <tr className="ui-table-spacer" aria-hidden="true">
                  <td colSpan={columns.length + (selectable ? 1 : 0)} style={{ height: bottomSpacer }} />
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && filteredRows.length > 0 ? (
        <div className="ui-pagination" role="navigation" aria-label="Pagination">
          <span>
            {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, filteredRows.length)} of {filteredRows.length}
          </span>
          <Select
            aria-label="Rows per page"
            value={pageSize}
            onChange={(event) => setPageSize(Number(event.target.value))}
            className="ui-pagination-size"
          >
            {pageSizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </Select>
          <Button size="sm" variant="secondary" disabled={safePage <= 1} onClick={() => setPage(safePage - 1)}>
            Previous
          </Button>
          <span aria-live="polite">Page {safePage} of {pageCount}</span>
          <Button size="sm" variant="secondary" disabled={safePage >= pageCount} onClick={() => setPage(safePage + 1)}>
            Next
          </Button>
        </div>
      ) : null}
    </div>
  );
}
