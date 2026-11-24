"use client";

import { forwardRef, type ComponentPropsWithoutRef } from "react";
import Link from "next/link";
import { Icon, type IconName } from "./icons";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";
export type ButtonSize = "sm" | "md";
export type DemoState = "default" | "hover" | "focus" | "loading";

export interface ButtonProps extends ComponentPropsWithoutRef<"button"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  iconOnly?: boolean;
  icon?: IconName;
  demoState?: DemoState;
}

export function buttonClass({
  variant = "primary",
  size = "md",
  iconOnly = false,
  className = "",
}: Pick<ButtonProps, "variant" | "size" | "iconOnly" | "className"> = {}) {
  return [
    "ui-button",
    `ui-button--${variant}`,
    size === "sm" ? "ui-button--sm" : "",
    iconOnly ? "ui-button--icon" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    loading = false,
    iconOnly = false,
    icon,
    demoState = "default",
    className,
    children,
    disabled,
    type = "button",
    ...props
  },
  ref,
) {
  const forced = demoState === "loading" ? "loading" : demoState;
  return (
    <button
      {...props}
      ref={ref}
      type={type}
      className={buttonClass({ variant, size, iconOnly, className })}
      disabled={disabled || loading}
      data-loading={loading || forced === "loading" ? "true" : undefined}
      data-demo-state={demoState === "hover" || demoState === "focus" ? demoState : undefined}
      aria-busy={loading || forced === "loading" ? true : undefined}
    >
      {loading || forced === "loading" ? <span className="ui-spinner" aria-hidden="true" /> : null}
      {icon && !loading ? <Icon name={icon} size={size === "sm" ? 16 : 16} /> : null}
      {children}
    </button>
  );
});

export interface ButtonLinkProps extends ComponentPropsWithoutRef<typeof Link> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconOnly?: boolean;
  icon?: IconName;
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  iconOnly = false,
  icon,
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link {...props} className={buttonClass({ variant, size, iconOnly, className })}>
      {icon ? <Icon name={icon} /> : null}
      {children}
    </Link>
  );
}
