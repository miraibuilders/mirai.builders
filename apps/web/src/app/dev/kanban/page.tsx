"use client";

import { useEffect, useState } from "react";
import { Badge, ButtonLink, PageHeader } from "@/ui";
import { KanbanBoard, KanbanHint, type KanbanColumnData } from "@/ui/kanban";

import "../dev.css";

const STAGES = [
  { id: "new", title: "New" },
  { id: "contacted", title: "Contacted" },
  { id: "checking", title: "Checking" },
  { id: "quoted", title: "Quoted" },
  { id: "won", title: "Won" },
  { id: "lost", title: "Lost" },
];

interface DemoCard {
  id: string;
  title: string;
  stage: string;
  score: number;
  tier: string;
}

const initialCards: DemoCard[] = Array.from({ length: 10 }, (_, index) => ({
  id: index === 4 ? "card-rollback" : `card-${index + 1}`,
  title: index === 4 ? "Rollback company" : `Company ${index + 1}`,
  stage: STAGES[index % 3].id,
  score: 40 + index * 5,
  tier: index % 2 === 0 ? "A" : "B",
}));

const STORAGE_KEY = "mirai-stage2-kanban";

export default function KanbanDemoPage() {
  const [cards, setCards] = useState(initialCards);
  const [hydrated, setHydrated] = useState(false);
  const [moveLog, setMoveLog] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setCards(JSON.parse(saved) as DemoCard[]);
      } catch {
        setCards(initialCards);
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  }, [cards, hydrated]);

  const columns: KanbanColumnData[] = STAGES.map((stage) => ({
    ...stage,
    cards: cards
      .filter((card) => card.stage === stage.id)
      .map((card) => ({
        id: card.id,
        title: card.title,
        label: `${card.title}, score ${card.score}, tier ${card.tier}`,
        badge: <Badge tone={card.tier === "A" ? "success" : "info"} icon="star">Tier {card.tier}</Badge>,
        meta: `Score ${card.score}`,
      })),
  }));

  return (
    <main className="ui-demo-page dev-kanban">
      <PageHeader
        title="Kanban demo"
        description="Keyboard dragging, optimistic moves, rollback, and localStorage persistence."
        actions={
          <>
            <ButtonLink href="/dev/components" variant="secondary">Components</ButtonLink>
            <ButtonLink href="/dev/data-table" variant="secondary">Data table</ButtonLink>
          </>
        }
      />
      <KanbanHint />
      <p className="dev-status-line ui-mono" aria-live="polite">Move log: {moveLog}</p>
      <KanbanBoard
        columns={columns}
        onMove={(cardId, from, to) => {
          setMoveLog(`${cardId}: ${from} → ${to}`);
          if (cardId === "card-rollback") {
            return Promise.reject(new Error("Simulated server failure"));
          }
          setCards((current) =>
            current.map((card) => (card.id === cardId ? { ...card, stage: to } : card)),
          );
          return Promise.resolve();
        }}
      />
    </main>
  );
}
