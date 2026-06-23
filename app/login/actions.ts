"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/lib/action-result";

function mensagemErroLogin(message: string) {
  const lower = message.toLowerCase();
  if (
    lower.includes("invalid login credentials") ||
    lower.includes("credenciais") ||
    lower.includes("email ou senha")
  ) {
    return "Email ou senha incorretos. Verifique e tente novamente.";
  }
  return message;
}

export async function login(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return { error: mensagemErroLogin(error?.message ?? "Erro ao entrar") };
  }

  const user = await prisma.user.findUnique({ where: { id: data.user.id } });

  redirect(user?.role === "LAVAJATO" ? "/painel/cadastro" : "/");
  return {};
}
