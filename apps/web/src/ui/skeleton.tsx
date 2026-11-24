import type { CSSProperties } from "react";

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  circle?: boolean;
}

export function Skeleton({ width = "100%", height = 16, circle = false }: SkeletonProps) {
  const style: CSSProperties = { width, height, borderRadius: circle ? "50%" : undefined };
  return <span className="ui-skeleton" style={style} aria-hidden="true" />;
}

export function SkeletonLines({ rows = 3, widths }: { rows?: number; widths?: string[] }) {
  return (
    <span className="ui-skeleton-lines" aria-hidden="true">
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton key={index} width={widths?.[index] ?? "100%"} />
      ))}
    </span>
  );
}

export function SkeletonTable({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <span className="ui-skeleton-block" role="status" aria-label="Loading">
      <span className="ui-sr-only">Loading</span>
      <span className="ui-skeleton-table" aria-hidden="true">
        {Array.from({ length: rows }, (_, row) => (
          <span className="ui-skeleton-table-row" key={row}>
            {Array.from({ length: columns }, (_, column) => (
              <Skeleton key={column} height={row === 0 ? 12 : 24} />
            ))}
          </span>
        ))}
      </span>
    </span>
  );
}
