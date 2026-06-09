// components/builder/ui.tsx
// Primitivos de formulário do builder, seguindo o tema "pergaminho" de app/globals.css.
"use client";

import { useEffect, useId } from "react";

export function Field({
  label, error, hint, children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-ink">{label}</label>
      <div className="mt-1.5">{children}</div>
      {hint && !error && <p className="mt-1 text-xs text-ink-soft">{hint}</p>}
      {error && <p className="mt-1 text-xs text-blood">{error}</p>}
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-edge bg-panel px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-accent disabled:cursor-not-allowed disabled:opacity-50";

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input type="text" {...props} className={`${inputClass} ${props.className ?? ""}`} />;
}

export function NumberInput({
  value, onChange, min, max, ...rest
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> & {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <input
      type="number"
      value={Number.isFinite(value) ? value : ""}
      min={min}
      max={max}
      onChange={(e) => {
        const n = Number(e.target.value);
        if (Number.isFinite(n)) onChange(n);
      }}
      {...rest}
      className={`${inputClass} ${rest.className ?? ""}`}
    />
  );
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={props.rows ?? 4} {...props} className={`${inputClass} ${props.className ?? ""}`} />;
}

export function Select({
  value, onChange, options, placeholder, disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={inputClass}
    >
      {placeholder !== undefined && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

// Input com sugestões (datalist nativo): escolhe da lista OU digita um valor novo.
export function Combobox({
  value, onChange, options, placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
}) {
  const listId = useId();
  return (
    <>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        list={listId}
        className={inputClass}
      />
      <datalist id={listId}>
        {options.map((o) => (
          <option key={o} value={o} />
        ))}
      </datalist>
    </>
  );
}

export function Toggle({
  checked, onChange, label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-[--accent]"
      />
      {label}
    </label>
  );
}

export function Button({
  variant = "primary", children, className, ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger";
}) {
  const variants = {
    primary: "border-edge bg-accent text-white hover:opacity-90",
    ghost: "border-edge bg-panel text-ink hover:border-accent hover:bg-panel-strong",
    danger: "border-blood/40 bg-blood/5 text-blood hover:bg-blood/10",
  } as const;
  return (
    <button
      type="button"
      {...props}
      className={`rounded-lg border px-3 py-1.5 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className ?? ""}`}
    >
      {children}
    </button>
  );
}

export function Badge({
  children, tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "danger" | "success" | "accent";
}) {
  const tones = {
    neutral: "border-edge bg-panel-strong text-ink-soft",
    danger: "border-blood/40 bg-blood/5 text-blood",
    success: "border-success/40 bg-success/5 text-success",
    accent: "border-accent/40 bg-panel-strong text-accent",
  } as const;
  return (
    <span className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function Modal({
  open, onClose, title, children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-edge bg-panel p-6 shadow-xl fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">{title}</h2>
          <Button variant="ghost" onClick={onClose} aria-label="Fechar">
            ✕
          </Button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open, title, message, confirmLabel = "Confirmar", onConfirm, onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <p className="text-sm text-ink">{message}</p>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}

export function Toast({ message, tone }: { message: string; tone: "success" | "danger" }) {
  return (
    <div
      className={`fixed bottom-4 right-4 z-50 rounded-lg border px-4 py-2 text-sm font-semibold shadow-lg fade-in ${
        tone === "success"
          ? "border-success/40 bg-panel text-success"
          : "border-blood/40 bg-panel text-blood"
      }`}
    >
      {message}
    </div>
  );
}
