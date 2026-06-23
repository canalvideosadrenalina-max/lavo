"use client";

import { useState } from "react";
import { IconCheck, IconEye, IconEyeOff, IconX } from "@/components/auth/auth-icons";

type AuthFieldProps = {
  id: string;
  label: string;
  name?: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  valid: boolean;
  showStatus: boolean;
  errorMessage?: string;
  required?: boolean;
  autoComplete?: string;
  inputMode?: "text" | "email" | "tel" | "numeric";
  minLength?: number;
  readOnly?: boolean;
  rightSlot?: React.ReactNode;
};

export function AuthField({
  id,
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  onBlur,
  valid,
  showStatus,
  errorMessage,
  required,
  autoComplete,
  inputMode,
  minLength,
  readOnly,
  rightSlot,
}: AuthFieldProps) {
  const statusVisible = showStatus && value.length > 0;
  const hasRight = statusVisible || rightSlot;

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="lavo-label">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          required={required}
          autoComplete={autoComplete}
          inputMode={inputMode}
          minLength={minLength}
          readOnly={readOnly}
          className={`lavo-input min-h-[48px] py-3.5 text-base ${hasRight ? "pr-20" : "pr-12"} ${readOnly ? "bg-[#F0F4F8]" : ""}`}
          aria-invalid={statusVisible ? !valid : undefined}
          aria-describedby={errorMessage && statusVisible && !valid ? `${id}-error` : undefined}
        />
        {rightSlot && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
            {rightSlot}
          </div>
        )}
        {statusVisible && (
          <div
            className={`absolute ${rightSlot ? "right-14" : "right-3"} top-1/2 -translate-y-1/2 ${
              valid ? "text-emerald-600" : "text-red-600"
            }`}
            aria-hidden
          >
            {valid ? <IconCheck /> : <IconX />}
          </div>
        )}
      </div>
      {errorMessage && statusVisible && !valid && (
        <p id={`${id}-error`} className="text-sm text-red-600" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  );
}

export function PasswordField({
  id,
  label,
  name,
  value,
  onChange,
  onBlur,
  valid,
  showStatus,
  errorMessage,
  autoComplete = "current-password",
  minLength,
}: Omit<AuthFieldProps, "type" | "rightSlot">) {
  const [visible, setVisible] = useState(false);

  return (
    <AuthField
      id={id}
      label={label}
      name={name}
      type={visible ? "text" : "password"}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      valid={valid}
      showStatus={showStatus}
      errorMessage={errorMessage}
      required
      autoComplete={autoComplete}
      minLength={minLength}
      rightSlot={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="rounded-lg p-2 text-muted transition hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent/25"
          aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
        >
          {visible ? <IconEyeOff className="h-5 w-5" /> : <IconEye className="h-5 w-5" />}
        </button>
      }
    />
  );
}
