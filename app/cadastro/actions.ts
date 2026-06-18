"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { normalizarTelefone, telefoneValido } from "@/lib/otp";
import { criarEnviarOtp } from "@/lib/otp-service";

function mensagemErroCadastro(message: string): string {
  if (message.includes("rate limit")) {
    return "Limite de e-mails atingido. Aguarde alguns minutos ou desative a confirmação por e-mail no Supabase (Authentication → Email).";
  }
  return message;
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const nome = formData.get("nome") as string;
  const role = formData.get("role") as string;
  const telefoneRaw = formData.get("telefone") as string;
  const telefone = normalizarTelefone(telefoneRaw);

  if (!telefoneValido(telefone)) {
    redirect(`/cadastro?error=${encodeURIComponent("Informe um telefone válido com DDD.")}`);
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { nome, role, telefone } },
  });

  if (error) {
    redirect(`/cadastro?error=${encodeURIComponent(mensagemErroCadastro(error.message))}`);
  }

  if (!data.user) {
    redirect(`/cadastro?error=${encodeURIComponent("Não foi possível criar a conta.")}`);
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

  const otp = await criarEnviarOtp(telefone);
  if (!otp.ok) {
    redirect(`/cadastro?error=${encodeURIComponent(otp.error)}`);
  }

  if (!data.session) {
    redirect(
      `/login?info=${encodeURIComponent("Conta criada! Confirme seu e-mail, faça login e valide o código enviado no WhatsApp.")}`
    );
  }

  redirect("/confirmar-telefone");
}
