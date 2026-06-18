import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function redirectSeTelefoneNaoConfirmado(userId: string) {
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { telefoneConfirmado: true },
  });

  if (dbUser && !dbUser.telefoneConfirmado) {
    redirect("/confirmar-telefone");
  }
}

export function redirectPosConfirmacaoTelefone(role: string) {
  redirect(role === "LAVAJATO" ? "/painel/cadastro" : "/");
}
