"use client";

import {
  cloneElement,
  useEffect,
  useId,
  useRef,
  useState,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { Button } from "./button";

type DialogPlacement = "center" | "drawer" | "popover";
type DialogSize = "sm" | "md" | "lg";
type InitialFocus = "auto" | "primary" | "first-field" | "cancel";

let activeDialogs: number[] = [];
let dialogCounter = 0;

function getFocusable(container: HTMLElement) {
  const selector =
    'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  return Array.from(container.querySelectorAll<HTMLElement>(selector)).filter(
    (element) => element.getClientRects().length > 0,
  );
}

export interface DialogBehaviorOptions {
  open: boolean;
  onClose: () => void;
  containerRef: RefObject<HTMLElement | null>;
  layerRef?: RefObject<HTMLElement | null>;
  trap?: boolean;
  inertBackground?: boolean;
  initialFocus?: InitialFocus;
}

export function useDialogBehavior({
  open,
  onClose,
  containerRef,
  layerRef,
  trap = true,
  inertBackground = true,
  initialFocus = "auto",
}: DialogBehaviorOptions) {
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const container = containerRef.current;
    if (!container) return;

    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const layer = layerRef?.current ?? null;
    const siblings = inertBackground
      ? Array.from(document.body.children).filter(
          (node) => node !== layer && !node.classList.contains("ui-toast-viewport"),
        )
      : [];
    const previous = siblings.map((node) => ({
      node,
      inert: node.hasAttribute("inert"),
      hidden: node.getAttribute("aria-hidden"),
    }));
    siblings.forEach((node) => {
      node.setAttribute("inert", "");
      node.setAttribute("aria-hidden", "true");
    });

    const dialogId = ++dialogCounter;
    activeDialogs.push(dialogId);

    const focusFrame = requestAnimationFrame(() => {
      const focusables = getFocusable(container);
      let target: HTMLElement | null = null;
      if (initialFocus === "primary") {
        target = container.querySelector<HTMLElement>("[data-ui-primary]");
      } else if (initialFocus === "first-field") {
        target = container.querySelector<HTMLElement>('input:not([type="hidden"]), select, textarea');
      } else if (initialFocus === "cancel") {
        target = container.querySelector<HTMLElement>("[data-ui-cancel]");
      } else {
        target =
          container.querySelector<HTMLElement>("[data-ui-autofocus]") ??
          container.querySelector<HTMLElement>('input:not([type="hidden"]), select, textarea') ??
          container.querySelector<HTMLElement>("[data-ui-primary]") ??
          focusables[0] ??
          null;
      }
      (target ?? container).focus();
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (activeDialogs[activeDialogs.length - 1] !== dialogId) return;
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab" || !trap) return;
      const focusables = getFocusable(container);
      if (focusables.length === 0) {
        event.preventDefault();
        container.focus();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === container)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      } else if (!container.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      cancelAnimationFrame(focusFrame);
      activeDialogs = activeDialogs.filter((id) => id !== dialogId);
      previous.forEach(({ node, inert, hidden }) => {
        if (inert) node.setAttribute("inert", "");
        else node.removeAttribute("inert");
        if (hidden === null) node.removeAttribute("aria-hidden");
        else node.setAttribute("aria-hidden", hidden);
      });
      if (trigger) {
        requestAnimationFrame(() => {
          if (document.contains(trigger)) trigger.focus();
        });
      }
    };
  }, [open, containerRef, layerRef, trap, inertBackground, initialFocus]);
}

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  size?: DialogSize;
  closeLabel?: string;
  dismissOnBackdrop?: boolean;
  initialFocus?: InitialFocus;
  placement?: DialogPlacement;
  side?: "right" | "left" | "bottom";
  variant?: "default" | "palette";
}

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  closeLabel = "Close dialog",
  dismissOnBackdrop = true,
  initialFocus = "auto",
  placement = "center",
  side = "right",
  variant = "default",
}: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const headingId = `ui-dialog-${useId().replace(/:/g, "")}`;

  useEffect(() => {
    setMounted(true);
  }, []);

  useDialogBehavior({
    open: open && mounted,
    onClose,
    containerRef: panelRef,
    layerRef,
    inertBackground: placement !== "popover",
    initialFocus,
  });

  if (!mounted || !open) return null;

  return createPortal(
    <div className="ui-dialog-layer" data-placement={placement} data-side={side} data-variant={variant} ref={layerRef}>
      <div
        className="ui-dialog-backdrop"
        aria-hidden="true"
        onMouseDown={(event) => {
          if (dismissOnBackdrop && event.target === event.currentTarget) onClose();
        }}
      />
      <div
        className="ui-dialog-panel"
        data-size={size}
        role="dialog"
        aria-modal={placement === "popover" ? undefined : true}
        aria-labelledby={headingId}
        aria-describedby={description ? `${headingId}-description` : undefined}
        tabIndex={-1}
        ref={panelRef}
      >
        <div className="ui-dialog-header">
          <div className="ui-dialog-headings">
            <h2 className="ui-dialog-title" id={headingId}>
              {title}
            </h2>
            {description ? (
              <p className="ui-dialog-description" id={`${headingId}-description`}>
                {description}
              </p>
            ) : null}
          </div>
          <Button
            className="ui-dialog-close"
            variant="ghost"
            iconOnly
            icon="close"
            aria-label={closeLabel}
            onClick={onClose}
          />
        </div>
        {children ? <div className="ui-dialog-body">{children}</div> : null}
        {footer ? <div className="ui-dialog-footer">{footer}</div> : null}
      </div>
    </div>,
    document.body,
  );
}

export function Modal(props: Omit<DialogProps, "placement">) {
  return <Dialog {...props} placement="center" />;
}

export function Drawer(props: Omit<DialogProps, "placement">) {
  return <Dialog {...props} placement="drawer" />;
}

export interface ConfirmationDialogProps extends Omit<DialogProps, "children" | "footer"> {
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "primary" | "destructive";
  onConfirm: () => void | Promise<void>;
}

export function ConfirmationDialog({
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "destructive",
  onConfirm,
  onClose,
  initialFocus,
  ...props
}: ConfirmationDialogProps) {
  const [pending, setPending] = useState(false);

  return (
    <Dialog
      {...props}
      onClose={onClose}
      initialFocus={initialFocus ?? "auto"}
      footer={
        <>
          <Button data-ui-cancel variant="secondary" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button
            data-ui-primary
            variant={tone}
            loading={pending}
            onClick={async () => {
              setPending(true);
              try {
                await onConfirm();
              } finally {
                setPending(false);
              }
            }}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p>{description}</p>
    </Dialog>
  );
}

export interface PopoverProps {
  open: boolean;
  onClose: () => void;
  label: string;
  trigger: ReactElement<Record<string, unknown>>;
  children: ReactNode;
}

export function Popover({ open, onClose, label, trigger, children }: PopoverProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  useDialogBehavior({ open, onClose, containerRef: panelRef, inertBackground: false, trap: false });

  return (
    <span className="ui-popover-root">
      {cloneElement(trigger, {
        "aria-expanded": open,
        "aria-haspopup": "dialog",
        onClick: (event: MouseEvent<HTMLElement>) => {
          const original = trigger.props.onClick;
          if (typeof original === "function") original(event);
        },
      })}
      {open ? (
        <div className="ui-popover-panel" role="dialog" aria-label={label} tabIndex={-1} ref={panelRef}>
          {children}
        </div>
      ) : null}
    </span>
  );
}
