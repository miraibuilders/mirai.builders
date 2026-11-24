"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Badge } from "./badge";
import { Button } from "./button";
import { InlineBanner } from "./banner";
import { Popover } from "./dialog";
import { Select } from "./field";
import { Icon } from "./icons";
import { SkeletonLines } from "./skeleton";
import { useToast } from "./toast";

export interface KanbanCardData {
  id: string;
  title: string;
  label?: string;
  badge?: ReactNode;
  meta?: ReactNode;
  attributes?: Record<string, string>;
  actions?: ReactNode;
}

export interface KanbanColumnData {
  id: string;
  title: string;
  cards: KanbanCardData[];
  attributes?: Record<string, string>;
}

export interface KanbanBoardProps {
  columns: KanbanColumnData[];
  onMove: (cardId: string, fromColumnId: string, toColumnId: string) => void | Promise<void>;
  className?: string;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

function moveCard(columns: KanbanColumnData[], cardId: string, fromId: string, toId: string) {
  let moved: KanbanCardData | undefined;
  const withoutCard = columns.map((column) => {
    if (column.id !== fromId) return column;
    const found = column.cards.find((card) => card.id === cardId);
    if (!found) return column;
    moved = found;
    return { ...column, cards: column.cards.filter((card) => card.id !== cardId) };
  });
  if (!moved) return columns;
  return withoutCard.map((column) =>
    column.id === toId ? { ...column, cards: [...column.cards, moved!] } : column,
  );
}

export function KanbanBoard({ columns, onMove, className, loading = false, error = null, onRetry }: KanbanBoardProps) {
  const toast = useToast();
  const [board, setBoard] = useState(columns);
  const [view, setView] = useState<"board" | "list">("board");
  const [stageFilter, setStageFilter] = useState("");
  const [menuCard, setMenuCard] = useState<{ cardId: string; columnId: string } | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropColumn, setDropColumn] = useState<string | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);
  const previousBoard = useRef(board);

  useEffect(() => {
    setBoard(columns);
  }, [columns]);

  const move = async (cardId: string, fromId: string, toId: string) => {
    if (fromId === toId) return;
    previousBoard.current = board;
    setBoard((current) => moveCard(current, cardId, fromId, toId));
    setMovingId(cardId);
    try {
      await onMove(cardId, fromId, toId);
    } catch (cause) {
      setBoard(previousBoard.current);
      toast({
        tone: "error",
        title: "Move failed",
        description: cause instanceof Error ? cause.message : "The card was returned to its original stage.",
      });
    } finally {
      setMovingId(null);
    }
  };

  const moveMenu = (card: KanbanCardData, columnId: string) => (
    <Popover
      open={menuCard?.cardId === card.id}
      onClose={() => setMenuCard(null)}
      label={`Move ${card.title} to stage`}
      trigger={
        <button
          type="button"
          className="ui-kanban-card"
          data-moving={movingId === card.id ? "true" : undefined}
          draggable={view === "board"}
          aria-label={card.label ?? card.title}
          onClick={() => setMenuCard({ cardId: card.id, columnId })}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setMenuCard({ cardId: card.id, columnId });
            }
          }}
          onDragStart={(event) => {
            event.dataTransfer.setData("text/plain", card.id);
            event.dataTransfer.effectAllowed = "move";
            setDraggingId(card.id);
          }}
          onDragEnd={() => {
            setDraggingId(null);
            setDropColumn(null);
          }}
        >
          <span className="ui-kanban-card-title">{card.title}</span>
          <span className="ui-kanban-card-meta">
            {card.badge}
            {card.meta}
          </span>
          <span className="ui-kanban-card-hint" aria-hidden="true">
            Enter to move
          </span>
        </button>
      }
    >
      <span className="ui-popover-heading">Move to stage</span>
      {columns.map((column) => (
        <Button
          key={column.id}
          size="sm"
          variant={column.id === columnId ? "secondary" : "ghost"}
          disabled={column.id === columnId}
          onClick={() => {
            const target = menuCard;
            setMenuCard(null);
            if (target) void move(target.cardId, target.columnId, column.id);
          }}
        >
          {column.title}
        </Button>
      ))}
    </Popover>
  );

  return (
    <div className={className ? `ui-kanban ${className}` : "ui-kanban"}>
      <div className="ui-kanban-toolbar">
        <div role="group" aria-label="Kanban view">
          <Button
            size="sm"
            variant={view === "board" ? "secondary" : "ghost"}
            aria-pressed={view === "board"}
            onClick={() => setView("board")}
          >
            Board
          </Button>
          <Button
            size="sm"
            variant={view === "list" ? "secondary" : "ghost"}
            aria-pressed={view === "list"}
            onClick={() => setView("list")}
          >
            List
          </Button>
        </div>
        {view === "list" ? (
          <Select
            aria-label="Filter by stage"
            value={stageFilter}
            onChange={(event) => setStageFilter(event.target.value)}
          >
            <option value="">All stages</option>
            {columns.map((column) => (
              <option key={column.id} value={column.id}>
                {column.title}
              </option>
            ))}
          </Select>
        ) : null}
      </div>

      {error ? (
        <InlineBanner tone="danger" title="Could not load board">
          {error}
          {onRetry ? <Button size="sm" onClick={onRetry}>Retry</Button> : null}
        </InlineBanner>
      ) : null}

      {loading ? (
        <div className="ui-kanban">
          {columns.map((column) => (
            <section className="ui-kanban-column" key={column.id}>
              <h3>{column.title}</h3>
              <SkeletonLines rows={3} />
            </section>
          ))}
        </div>
      ) : view === "board" ? (
        <div className="ui-kanban-board">
          {board.map((column) => {
            const { className: columnClassName, ...columnAttributes } = column.attributes ?? {};
            return (
              <section
                key={column.id}
                className={columnClassName ? `ui-kanban-column ${columnClassName}` : "ui-kanban-column"}
                {...columnAttributes}
                aria-label={columnAttributes["aria-label"] ?? `${column.title}, ${column.cards.length} cards`}
                data-drop-target={dropColumn === column.id ? "true" : undefined}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDropColumn(column.id);
                }}
                onDragLeave={() => setDropColumn((current) => (current === column.id ? null : current))}
                onDrop={(event) => {
                  event.preventDefault();
                  const cardId = event.dataTransfer.getData("text/plain") || draggingId;
                  setDropColumn(null);
                  setDraggingId(null);
                  if (cardId) void move(cardId, columnIdOf(board, cardId), column.id);
                }}
              >
                <h3 className="ui-kanban-column-heading">
                  {column.title}
                  <span className="ui-kanban-count">{column.cards.length}</span>
                </h3>
                <div className="ui-kanban-cards">
                  {column.cards.map((card) => {
                    const { className: cardClassName, ...cardAttributes } = card.attributes ?? {};
                    return (
                      <div
                        key={card.id}
                        className={cardClassName ? `ui-kanban-card-wrap ${cardClassName}` : "ui-kanban-card-wrap"}
                        {...cardAttributes}
                        draggable={view === "board"}
                        onDragStart={(event) => {
                          event.dataTransfer.setData("text/plain", card.id);
                          event.dataTransfer.effectAllowed = "move";
                          setDraggingId(card.id);
                        }}
                        onDragEnd={() => {
                          setDraggingId(null);
                          setDropColumn(null);
                        }}
                      >
                        {moveMenu(card, column.id)}
                        {card.actions}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="ui-kanban-list">
          {board
            .filter((column) => !stageFilter || column.id === stageFilter)
            .flatMap((column) => column.cards.map((card) => (
              <div className="ui-kanban-list-row" key={card.id}>
                <Badge tone="info" icon="chevron-right">{column.title}</Badge>
                {moveMenu(card, column.id)}
              </div>
            )))}
        </div>
      )}
    </div>
  );
}

function columnIdOf(columns: KanbanColumnData[], cardId: string) {
  return columns.find((column) => column.cards.some((card) => card.id === cardId))?.id ?? "";
}

export function KanbanCardBadge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "brand" | "success" | "warning" | "danger" | "info" }) {
  return (
    <Badge tone={tone} icon="star">
      {children}
    </Badge>
  );
}

export function KanbanHint() {
  return (
    <span className="ui-kanban-hint">
      <Icon name="info" /> Drag a card, or focus it and press Enter to move stages.
    </span>
  );
}
