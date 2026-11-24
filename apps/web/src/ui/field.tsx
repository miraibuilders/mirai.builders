"use client";

import { forwardRef, useId, type ComponentPropsWithoutRef, type ReactNode } from "react";
import type { DemoState } from "./button";

function controlClass(className?: string, demoState?: DemoState, base = "ui-input") {
  return [base, className].filter(Boolean).join(" ");
}

function demoAttributes(demoState?: DemoState) {
  return {
    "data-demo-state": demoState === "hover" || demoState === "focus" ? demoState : undefined,
  };
}

export interface InputProps extends ComponentPropsWithoutRef<"input"> {
  demoState?: DemoState;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, demoState, ...props },
  ref,
) {
  return <input {...props} {...demoAttributes(demoState)} ref={ref} className={controlClass(className, demoState)} />;
});

export interface TextareaProps extends ComponentPropsWithoutRef<"textarea"> {
  demoState?: DemoState;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, demoState, ...props },
  ref,
) {
  return (
    <textarea
      {...props}
      {...demoAttributes(demoState)}
      ref={ref}
      className={controlClass(className, demoState, "ui-textarea")}
    />
  );
});

export interface SelectProps extends ComponentPropsWithoutRef<"select"> {
  demoState?: DemoState;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, demoState, ...props },
  ref,
) {
  return (
    <select
      {...props}
      {...demoAttributes(demoState)}
      ref={ref}
      className={controlClass(className, demoState, "ui-select")}
    />
  );
});

export interface FormFieldRenderProps {
  id: string;
  describedBy: string | undefined;
  invalid: true | undefined;
}

export interface FormFieldProps {
  label: string;
  name?: string;
  help?: string;
  error?: string | null;
  required?: boolean;
  children: (props: FormFieldRenderProps) => ReactNode;
}

export function FormField({ label, help, error, required = false, children }: FormFieldProps) {
  const generatedId = useId();
  const id = `ui-field-${generatedId.replace(/:/g, "")}`;
  const helpId = help ? `${id}-help` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [helpId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="ui-field">
      <label className="ui-field-label" htmlFor={id}>
        {label}
        {required ? (
          <>
            <span className="ui-field-required" aria-hidden="true">
              {" "}
              *
            </span>
            <span className="ui-sr-only"> (required)</span>
          </>
        ) : (
          <span className="ui-field-optional">(optional)</span>
        )}
      </label>
      {help ? (
        <p className="ui-field-help" id={helpId}>
          {help}
        </p>
      ) : null}
      {children({ id, describedBy, invalid: error ? true : undefined })}
      {error ? (
        <p className="ui-field-error" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export interface FieldErrorLink {
  id: string;
  message: string;
}

export function ErrorSummary({ errors, title = "There is a problem" }: { errors: FieldErrorLink[]; title?: string }) {
  if (errors.length === 0) return null;
  return (
    <div className="ui-error-summary" role="alert" tabIndex={-1} data-testid="error-summary">
      <h2>{title}</h2>
      <ul>
        {errors.map((error) => (
          <li key={error.id}>
            <a href={`#${error.id}`}>{error.message}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
