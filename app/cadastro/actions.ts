"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { normalizarTelefone, telefoneValido } from "@/lib/otp";
import { criarEnviarOtp } from "@/lib/otp-service";
import { limparDocumento, validarDocumento } from "@/lib/lavajato-form";
import { verificarTokenTurnstile } from "@/lib/turnstile/verificar-token";

function mensagemErroCadastro(message: string): string {
  if (message.includes("rate limit")) {
    return "Limite de e-mails atingido. Aguarde alguns minutos ou desative a confirmação por e-mail no Supabase (Authentication → Email).";
  }
  return message;
}

function redirectCadastroErro(mensagem: string, slug?: string | null, role?: string | null): never {
  const params = new URLSearchParams({ error: mensagem });
  if (slug?.trim()) params.set("slug", slug.trim());
  if (role?.trim()) params.set("role", role.trim());
  redirect(`/cadastro?${params.toString()}`);
}

export async function signup(formData: FormData) {
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
    redirectCadastroErro(turnstile.error, slug, (formData.get("role") as string | null) ?? null);
  }

  if (!telefoneValido(telefone)) {
    redirectCadastroErro("Informe um telefone válido com DDD.", slug, "lavajato");
  }

  if (assumirLavajato) {
    if (role !== "LAVAJATO") {
      redirectCadastroErro("Selecione o perfil de dono de lava-jato.", slug, "lavajato");
    }

    const cnpj = limparDocumento(cnpjRaw ?? "");
    if (!validarDocumento("CNPJ", cnpj)) {
      redirectCadastroErro("Informe um CNPJ válido.", slug, "lavajato");
    }

    const lavaJato = await prisma.lavaJato.findFirst({ where: { slug } });
    if (!lavaJato) {
      redirectCadastroErro("Lava-jato não encontrado.", slug, "lavajato");
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
    redirectCadastroErro(
      mensagemErroCadastro(error.message),
      slug,
      assumirLavajato ? "lavajato" : null
    );
  }

  if (!data.user) {
    redirectCadastroErro(
      "Não foi possível criar a conta.",
      slug,
      assumirLavajato ? "lavajato" : null
    );
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
    redirectCadastroErro(otp.error, slug, assumirLavajato ? "lavajato" : null);
  }

  if (!data.session) {
    redirect(
      `/login?info=${encodeURIComponent("Conta criada! Confirme seu e-mail, faça login e valide o código enviado no WhatsApp.")}`
    );
  }

  redirect("/confirmar-telefone");
}
