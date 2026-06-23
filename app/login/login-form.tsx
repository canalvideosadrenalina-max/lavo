"use client";

import Link from "next/link";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { AuthField, PasswordField } from "@/components/auth/auth-field";
import { IconSpinner } from "@/components/auth/auth-icons";
import { login } from "./actions";
import { WaveDivider } from "@/components/ui/wave-divider";

type LoginFormProps = {
  serverError?: string;
  info?: string;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
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

function mensagemErroLogin(erro?: string) {
  if (!erro) return undefined;
  const lower = erro.toLowerCase();
  if (
    lower.includes("invalid login credentials") ||
    lower.includes("credenciais") ||
    lower.includes("email ou senha")
  ) {
    return "Email ou senha incorretos. Verifique e tente novamente.";
  }
  return erro;
}

export function LoginForm({ serverError, info }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const erro = mensagemErroLogin(serverError);

  return (
    <form action={login} className="lavo-section w-full max-w-sm space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Entrar</h1>
        <p className="mt-1 lavo-muted">Acesse sua conta Lavo</p>
      </div>
      <WaveDivider className="-mx-1" />

      {erro && (
        <div className="lavo-alert-error flex items-start gap-2" role="alert">
          <span className="mt-0.5 shrink-0 font-bold" aria-hidden>
            ✕
          </span>
          <span>{erro}</span>
        </div>
      )}
      {info && <p className="lavo-alert-success">{info}</p>}

      <AuthField
        id="email"
        label="Email"
        name="email"
        type="email"
        placeholder="seu@email.com"
        value={email}
        onChange={setEmail}
        valid={email.trim().length > 0}
        showStatus={false}
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
        valid={password.length > 0}
        showStatus={false}
        autoComplete="current-password"
      />

      <SubmitButton />

      <p className="text-center text-sm text-muted">
        Não tem conta?{" "}
        <Link href="/cadastro" className="lavo-link">
          Cadastre-se
        </Link>
      </p>
    </form>
  );
}
