"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { criarEnviarOtp, validarOtp } from "@/lib/otp-service";
import { redirectPosConfirmacaoTelefone } from "@/lib/auth/telefone";

export async function confirmarTelefone(formData: FormData) {
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
    redirect("/confirmar-telefone?error=Telefone não cadastrado.");
  }

  if (dbUser.telefoneConfirmado) {
    redirectPosConfirmacaoTelefone(dbUser.role);
  }

  const result = await validarOtp(dbUser.telefone, codigo);
  if (!result.ok) {
    redirect(`/confirmar-telefone?error=${encodeURIComponent(result.error)}`);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { telefoneConfirmado: true },
  });

  redirectPosConfirmacaoTelefone(dbUser.role);
}

export async function reenviarCodigoTelefone() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });

  if (!dbUser?.telefone) {
    redirect("/confirmar-telefone?error=Telefone não cadastrado.");
  }

  if (dbUser.telefoneConfirmado) {
    redirectPosConfirmacaoTelefone(dbUser.role);
  }

  const otp = await criarEnviarOtp(dbUser.telefone);
  if (!otp.ok) {
    redirect(`/confirmar-telefone?error=${encodeURIComponent(otp.error)}`);
  }

  redirect("/confirmar-telefone?ok=Código reenviado no WhatsApp.");
}
