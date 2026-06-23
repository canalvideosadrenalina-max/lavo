"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { AuthField, PasswordField } from "@/components/auth/auth-field";
import { IconSpinner } from "@/components/auth/auth-icons";
import { TurnstileWidget } from "@/components/turnstile/TurnstileWidget";
import { telefoneValido } from "@/lib/otp";
import { signup } from "./actions";
import { WaveDivider } from "@/components/ui/wave-divider";

type CadastroFormProps = {
  serverError?: string;
  assumirPerfil: boolean;
  lavaJatoNome?: string;
  slugParam: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function emailValido(email: string) {
  return EMAIL_RE.test(email.trim());
}

function nomeValido(nome: string) {
  return nome.trim().length >= 2;
}

function cnpjValido(cnpj: string) {
  return cnpj.replace(/\D/g, "").length === 14;
}

export type ForcaSenha = "fraca" | "media" | "forte";

export function forcaSenha(senha: string): ForcaSenha | null {
  if (!senha) return null;
  if (senha.length < 6) return "fraca";

  let score = 0;
  if (senha.length >= 8) score++;
  if (/[a-z]/.test(senha) && /[A-Z]/.test(senha)) score++;
  if (/\d/.test(senha)) score++;
  if (/[^a-zA-Z0-9]/.test(senha)) score++;

  if (score >= 3) return "forte";
  return "media";
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
          Cadastrando…
        </>
      ) : (
        "Cadastrar"
      )}
    </button>
  );
}

export function CadastroForm({ serverError, assumirPerfil, lavaJatoNome, slugParam }: CadastroFormProps) {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [role, setRole] = useState(assumirPerfil ? "LAVAJATO" : "CLIENTE");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const markTouched = (field: string) => setTouched((t) => ({ ...t, [field]: true }));

  const forca = forcaSenha(password);

  const validations = useMemo(() => {
    const nomeOk = nomeValido(nome);
    const telefoneOk = telefoneValido(telefone);
    const emailOk = emailValido(email);
    const confirmEmailOk = confirmEmail.length > 0 && confirmEmail.trim() === email.trim();
    const passwordOk = password.length >= 6;
    const confirmPasswordOk = confirmPassword.length > 0 && confirmPassword === password;
    const cnpjOk = !assumirPerfil || cnpjValido(cnpj);
    const roleOk = role === "CLIENTE" || role === "LAVAJATO";

    return {
      nomeOk,
      telefoneOk,
      emailOk,
      confirmEmailOk,
      passwordOk,
      confirmPasswordOk,
      cnpjOk,
      roleOk,
      allOk:
        nomeOk &&
        telefoneOk &&
        emailOk &&
        confirmEmailOk &&
        passwordOk &&
        confirmPasswordOk &&
        cnpjOk &&
        roleOk,
    };
  }, [nome, telefone, email, confirmEmail, password, confirmPassword, cnpj, role, assumirPerfil]);

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();
  const captchaOk = siteKey ? !!turnstileToken : true;
  const canSubmit = validations.allOk && captchaOk;

  const forcaLabel = forca === "forte" ? "Forte" : forca === "media" ? "Média" : forca === "fraca" ? "Fraca" : null;
  const forcaColor =
    forca === "forte" ? "text-emerald-600" : forca === "media" ? "text-amber-600" : "text-red-600";
  const forcaBar =
    forca === "forte" ? "w-full bg-emerald-500" : forca === "media" ? "w-2/3 bg-amber-500" : "w-1/3 bg-red-500";

  return (
    <form action={signup} className="lavo-section w-full space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Criar conta</h1>
        <p className="mt-1 lavo-muted">Cliente ou dono de lava-jato</p>
      </div>
      <WaveDivider className="-mx-1" />

      {assumirPerfil && (
        <div className="rounded-2xl bg-[#06B6D4] px-4 py-4 text-white shadow-md">
          <p className="text-sm leading-relaxed">
            Você está assumindo o perfil de{" "}
            <span className="font-bold">{lavaJatoNome ?? "este lava-jato"}</span>. Preencha seus dados
            para continuar.
          </p>
        </div>
      )}

      {serverError && <p className="lavo-alert-error">{serverError}</p>}

      {assumirPerfil && <input type="hidden" name="slug" value={slugParam} />}
      <input type="hidden" name="turnstile_token" value={turnstileToken ?? ""} />

      <AuthField
        id="nome"
        label="Nome"
        name="nome"
        placeholder="Seu nome completo"
        value={nome}
        onChange={setNome}
        onBlur={() => markTouched("nome")}
        valid={validations.nomeOk}
        showStatus={!!touched.nome}
        errorMessage="Informe pelo menos 2 caracteres"
        required
        autoComplete="name"
      />

      <AuthField
        id="telefone"
        label="WhatsApp"
        name="telefone"
        type="tel"
        placeholder="DDD + número"
        value={telefone}
        onChange={setTelefone}
        onBlur={() => markTouched("telefone")}
        valid={validations.telefoneOk}
        showStatus={!!touched.telefone}
        errorMessage="Informe um número válido com DDD"
        required
        autoComplete="tel"
        inputMode="tel"
      />

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

      <AuthField
        id="confirmEmail"
        label="Confirmar email"
        type="email"
        placeholder="Repita o email"
        value={confirmEmail}
        onChange={setConfirmEmail}
        onBlur={() => markTouched("confirmEmail")}
        valid={validations.confirmEmailOk}
        showStatus={!!touched.confirmEmail}
        errorMessage="Os emails não coincidem"
        required
        autoComplete="email"
        inputMode="email"
      />

      <div className="space-y-1.5">
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
          autoComplete="new-password"
          minLength={6}
        />
        {password.length > 0 && forcaLabel && (
          <div className="space-y-1" aria-live="polite">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
              <div className={`h-full rounded-full transition-all ${forcaBar}`} />
            </div>
            <p className={`text-xs font-medium ${forcaColor}`}>Força da senha: {forcaLabel}</p>
          </div>
        )}
      </div>

      <PasswordField
        id="confirmPassword"
        label="Confirmar senha"
        value={confirmPassword}
        onChange={setConfirmPassword}
        onBlur={() => markTouched("confirmPassword")}
        valid={validations.confirmPasswordOk}
        showStatus={!!touched.confirmPassword}
        errorMessage="As senhas não coincidem"
        autoComplete="new-password"
        minLength={6}
      />

      {assumirPerfil && (
        <AuthField
          id="cnpj"
          label="CNPJ"
          name="cnpj"
          placeholder="Somente números"
          value={cnpj}
          onChange={setCnpj}
          onBlur={() => markTouched("cnpj")}
          valid={validations.cnpjOk}
          showStatus={!!touched.cnpj}
          errorMessage="CNPJ deve ter 14 dígitos"
          required
          inputMode="numeric"
        />
      )}

      <div className="space-y-1.5">
        <label htmlFor="role" className="lavo-label">
          Tipo de conta
        </label>
        <select
          id="role"
          name="role"
          required
          value={role}
          onChange={(e) => {
            setRole(e.target.value);
            markTouched("role");
          }}
          onBlur={() => markTouched("role")}
          disabled={assumirPerfil}
          className="lavo-input min-h-[48px] py-3.5 text-base"
        >
          <option value="CLIENTE">Sou cliente</option>
          <option value="LAVAJATO">Sou dono de lava-jato</option>
        </select>
      </div>

      <TurnstileWidget
        key={serverError ?? "initial"}
        onTokenChange={setTurnstileToken}
      />

      <SubmitButton disabled={!canSubmit} />

      <p className="text-center text-sm text-muted">
        Já tem conta?{" "}
        <Link href="/login" className="lavo-link">
          Entrar
        </Link>
      </p>
    </form>
  );
}
