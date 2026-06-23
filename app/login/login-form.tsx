"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { AuthField, PasswordField } from "@/components/auth/auth-field";
import { IconSpinner } from "@/components/auth/auth-icons";
import { useActionToast } from "@/components/hooks/use-action-toast";
import { login } from "./actions";
import { WaveDivider } from "@/components/ui/wave-divider";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function emailValido(email: string) {
  return EMAIL_RE.test(email.trim());
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="lavo-btn-primary min-h-[48px] py-3.5 text-base gap-2"
    >
      {pending ? (
        <>
          <IconSpinner className="h-5 w-5" />
          Entrando…
        </>
      ) : (
        "Entrar"
      )}
    </button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState(login, null);
  useActionToast(state);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const markTouched = (field: string) => setTouched((t) => ({ ...t, [field]: true }));

  const validations = useMemo(() => {
    const emailOk = emailValido(email);
    const passwordOk = password.length >= 6;
    return { emailOk, passwordOk, allOk: emailOk && passwordOk };
  }, [email, password]);

  return (
    <form action={formAction} className="lavo-section w-full space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Entrar</h1>
        <p className="mt-1 lavo-muted">Acesse sua conta Lavo</p>
      </div>
      <WaveDivider className="-mx-1" />

      <AuthField
        id="email"
        label="Email"
        name="email"
        type="email"
        placeholder="seu@email.com"
        value={email}
        onChange={setEmail}
        onBlur={() => markTouched("email")}
        valid={validations.emailOk}
        showStatus={!!touched.email}
        errorMessage="Informe um email válido"
        required
        autoComplete="email"
        inputMode="email"
      />

      <PasswordField
        id="password"
        label="Senha"
        name="password"
        value={password}
        onChange={setPassword}
        onBlur={() => markTouched("password")}
        valid={validations.passwordOk}
        showStatus={!!touched.password}
        errorMessage="Mínimo de 6 caracteres"
        autoComplete="current-password"
        minLength={6}
      />

      <SubmitButton disabled={!validations.allOk} />

      <p className="text-center text-sm text-muted">
        Não tem conta?{" "}
        <Link href="/cadastro" className="lavo-link">
          Cadastre-se
        </Link>
      </p>
    </form>
  );
}
