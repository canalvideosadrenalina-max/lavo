"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { normalizarTelefone, telefoneValido } from "@/lib/otp";
import { criarEnviarOtp } from "@/lib/otp-service";
import { limparDocumento, validarDocumento } from "@/lib/lavajato-form";
import { verificarTokenTurnstile } from "@/lib/turnstile/verificar-token";
import type { ActionResult } from "@/lib/action-result";

function mensagemErroCadastro(message: string): string {
  if (message.includes("rate limit")) {
    return "Limite de e-mails atingido. Aguarde alguns minutos ou desative a confirmação por e-mail no Supabase (Authentication → Email).";
  }
  return message;
}

export async function signup(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const nome = formData.get("nome") as string;
  const role = formData.get("role") as string;
  const telefoneRaw = formData.get("telefone") as string;
  const telefone = normalizarTelefone(telefoneRaw);
  const slug = (formData.get("slug") as string | null)?.trim() || null;
  const cnpjRaw = formData.get("cnpj") as string | null;
  const assumirLavajato = !!slug;

  const turnstileToken = (formData.get("turnstile_token") as string | null)?.trim() ?? "";
  const turnstile = await verificarTokenTurnstile(turnstileToken);
  if (!turnstile.ok) {
    return { error: turnstile.error };
  }

  if (!telefoneValido(telefone)) {
    return { error: "Informe um telefone válido com DDD." };
  }

  if (assumirLavajato) {
    if (role !== "LAVAJATO") {
      return { error: "Selecione o perfil de dono de lava-jato." };
    }

    const cnpj = limparDocumento(cnpjRaw ?? "");
    if (!validarDocumento("CNPJ", cnpj)) {
      return { error: "Informe um CNPJ válido." };
    }

    const lavaJato = await prisma.lavaJato.findFirst({ where: { slug } });
    if (!lavaJato) {
      return { error: "Lava-jato não encontrado." };
    }
  }

  const cnpjClaim =
    assumirLavajato && cnpjRaw ? limparDocumento(cnpjRaw) : null;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { nome, role, telefone } },
  });

  if (error) {
    return { error: mensagemErroCadastro(error.message) };
  }

  if (!data.user) {
    return { error: "Não foi possível criar a conta." };
  }

  await prisma.user.upsert({
    where: { id: data.user.id },
    create: {
      id: data.user.id,
      email,
      nome,
      telefone,
      telefoneConfirmado: false,
      role: role === "LAVAJATO" ? "LAVAJATO" : "CLIENTE",
    },
    update: { telefone, telefoneConfirmado: false, nome },
  });

  if (assumirLavajato && slug && cnpjClaim) {
    await prisma.lavaJato.update({
      where: { slug },
      data: {
        ownerId: data.user.id,
        status: "ATIVO",
        disponivelAgora: true,
        tipoDocumento: "CNPJ",
        documento: cnpjClaim,
      },
    });
  }

  const otp = await criarEnviarOtp(telefone);
  if (!otp.ok) {
    return { error: otp.error };
  }

  if (!data.session) {
    return {
      info: "Conta criada! Confirme seu e-mail, faça login e valide o código enviado no WhatsApp.",
      redirectTo: "/login",
    };
  }

  redirect("/confirmar-telefone");
  return {};
}
