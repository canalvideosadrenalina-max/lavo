import { prisma } from "@/lib/prisma";
import { gerarCodigoOtp, OTP_EXPIRA_MINUTOS } from "@/lib/otp";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

export async function criarEnviarOtp(telefone: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const codigo = gerarCodigoOtp();
  const expiraEm = new Date(Date.now() + OTP_EXPIRA_MINUTOS * 60 * 1000);

  await prisma.otpCode.updateMany({
    where: { telefone, usado: false },
    data: { usado: true },
  });

  await prisma.otpCode.create({
    data: { telefone, codigo, expiraEm },
  });

  const envio = await sendWhatsAppMessage(
    telefone,
    `Seu código de verificação Lavo: ${codigo}. Válido por ${OTP_EXPIRA_MINUTOS} minutos.`
  );

  if (!envio.ok) {
    return { ok: false, error: envio.error ?? "Não foi possível enviar o código por WhatsApp." };
  }

  return { ok: true };
}

export async function validarOtp(
  telefone: string,
  codigo: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const otp = await prisma.otpCode.findFirst({
    where: {
      telefone,
      codigo,
      usado: false,
      expiraEm: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!otp) {
    return { ok: false, error: "Código inválido ou expirado." };
  }

  await prisma.otpCode.update({
    where: { id: otp.id },
    data: { usado: true },
  });

  return { ok: true };
}
