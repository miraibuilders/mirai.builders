"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Button } from "./button";
import { Icon } from "./icons";

export type ToastTone = "success" | "error" | "info";

export interface ToastOptions {
  tone: ToastTone;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  duration?: number;
}

interface ToastRecord extends ToastOptions {
  id: number;
}

const ToastContext = createContext<((options: ToastOptions) => void) | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const [mounted, setMounted] = useState(false);
  const nextId = useRef(0);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  useEffect(() => {
    setMounted(true);
  }, []);

  const dismiss = useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback(
    (options: ToastOptions) => {
      const id = nextId.current++;
      setToasts((current) => [...current.slice(-3), { ...options, id }]);
      const duration = options.duration ?? 5000;
      if (duration > 0) {
        timers.current.set(
          id,
          setTimeout(() => dismiss(id), duration),
        );
      }
    },
    [dismiss],
  );

  useEffect(() => {
    const active = timers.current;
    return () => {
      active.forEach((timer) => clearTimeout(timer));
      active.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {mounted
        ? createPortal(
            <div className="ui-toast-viewport">
              {toasts.map((item) => (
                <div
                  key={item.id}
                  className="ui-toast"
                  data-tone={item.tone}
                  data-testid={`toast-${item.tone}`}
                  role={item.tone === "error" ? "alert" : "status"}
                >
                  <div className="ui-toast-title">{item.title}</div>
                  {item.description ? <div className="ui-toast-description">{item.description}</div> : null}
                  {item.actionLabel ? (
                    <div className="ui-toast-actions">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          item.onAction?.();
                          dismiss(item.id);
                        }}
                      >
                        {item.actionLabel}
                      </Button>
                    </div>
                  ) : null}
                  <Button
                    variant="ghost"
                    size="sm"
                    iconOnly
                    icon="close"
                    aria-label="Dismiss notification"
                    onClick={() => dismiss(item.id)}
                  />
                </div>
              ))}
            </div>,
            document.body,
          )
        : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider");
  return context;
}

export function ToastIcon({ tone }: { tone: ToastTone }) {
  return <Icon name={tone === "error" ? "alert-circle" : tone === "success" ? "check-circle" : "info"} />;
}
