"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

async function getLavaJatoDoUsuario() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const lavaJato = await prisma.lavaJato.findUnique({ where: { ownerId: user.id } });
  if (!lavaJato) redirect("/painel/cadastro");

  return lavaJato;
}

export async function toggleDisponivelAgora() {
  const lavaJato = await getLavaJatoDoUsuario();

  await prisma.lavaJato.update({
    where: { id: lavaJato.id },
    data: { disponivelAgora: !lavaJato.disponivelAgora },
  });

  revalidatePath("/painel");
}

export async function aceitarAgendamento(agendamentoId: string) {
  const lavaJato = await getLavaJatoDoUsuario();

  const agendamento = await prisma.agendamento.findFirst({
    where: { id: agendamentoId, lavaJatoId: lavaJato.id, status: "PENDENTE" },
  });

  if (!agendamento) return;

  await prisma.agendamento.update({
    where: { id: agendamentoId },
    data: { status: "CONFIRMADO" },
  });

  revalidatePath("/painel");
}

export async function recusarAgendamento(agendamentoId: string) {
  const lavaJato = await getLavaJatoDoUsuario();

  const agendamento = await prisma.agendamento.findFirst({
    where: { id: agendamentoId, lavaJatoId: lavaJato.id, status: "PENDENTE" },
  });

  if (!agendamento) return;

  await prisma.agendamento.update({
    where: { id: agendamentoId },
    data: { status: "CANCELADO" },
  });

  revalidatePath("/painel");
}
