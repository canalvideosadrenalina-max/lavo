"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { criarEnviarOtp, validarOtp } from "@/lib/otp-service";
import { redirectPosConfirmacaoTelefone } from "@/lib/auth/telefone";
import type { ActionResult } from "@/lib/action-result";

export async function confirmarTelefone(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const codigo = (formData.get("codigo") as string)?.trim();
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });

  if (!dbUser?.telefone) {
    return { error: "Telefone não cadastrado." };
  }

  if (dbUser.telefoneConfirmado) {
    const returnUrl = (formData.get("returnUrl") as string | null)?.trim();
    if (returnUrl?.startsWith("/") && !returnUrl.startsWith("//")) {
      redirect(returnUrl);
    }
    redirectPosConfirmacaoTelefone(dbUser.role);
    return {};
  }

  const result = await validarOtp(dbUser.telefone, codigo);
  if (!result.ok) {
    return { error: result.error };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { telefoneConfirmado: true },
  });

  const returnUrl = (formData.get("returnUrl") as string | null)?.trim();
  if (returnUrl?.startsWith("/") && !returnUrl.startsWith("//")) {
    redirect(returnUrl);
  }

  redirectPosConfirmacaoTelefone(dbUser.role);
  return {};
}

export async function reenviarCodigoTelefone(
  _prev: ActionResult | null,
  _formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });

  if (!dbUser?.telefone) {
    return { error: "Telefone não cadastrado." };
  }

  if (dbUser.telefoneConfirmado) {
    redirectPosConfirmacaoTelefone(dbUser.role);
    return {};
  }

  const otp = await criarEnviarOtp(dbUser.telefone);
  if (!otp.ok) {
    return { error: otp.error };
  }

  return { success: "Código reenviado no WhatsApp." };
}
