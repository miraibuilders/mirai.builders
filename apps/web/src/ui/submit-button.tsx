"use client";

import { type ButtonHTMLAttributes } from "react";
import { useFormStatus } from "react-dom";
import { buttonClass, type ButtonSize, type ButtonVariant } from "./button";

export interface SubmitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function SubmitButton({
  variant = "primary",
  size = "md",
  className,
  children,
  disabled,
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus();
  return (
    <button
      {...props}
      type="submit"
      className={buttonClass({ variant, size, className })}
      disabled={disabled || pending}
      data-loading={pending ? "true" : undefined}
      aria-busy={pending || undefined}
    >
      {pending ? <span className="ui-spinner" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}
