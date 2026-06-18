"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { horarioDisponivelParaAgendamento, obterHorariosDisponiveis } from "@/lib/slots";
import { revalidatePath } from "next/cache";

export async function buscarHorariosDisponiveis(
  lavaJatoId: string,
  data: string,
  servicoIds: string[]
): Promise<{ horarios: string[]; error?: string }> {
  if (!lavaJatoId || !data || servicoIds.length === 0) {
    return { horarios: [], error: "Informe lava-jato, data e serviços" };
  }

  const servicos = await prisma.servico.findMany({
    where: {
      id: { in: servicoIds },
      lavaJatoId,
      ativo: true,
    },
  });

  if (servicos.length !== servicoIds.length) {
    return { horarios: [], error: "Serviços inválidos para este lava-jato" };
  }

  const duracaoTotalMin = servicos.reduce((total, s) => total + s.duracaoMin, 0);
  const horarios = await obterHorariosDisponiveis(lavaJatoId, data, duracaoTotalMin);

  return {
    horarios: horarios.map((h) => h.toISOString()),
  };
}

export async function criarAgendamento(
  lavaJatoId: string,
  dataHoraISO: string,
  servicoIds: string[]
): Promise<{ success: true; agendamentoId: string } | { success: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Faça login para agendar" };
  }

  if (!lavaJatoId || !dataHoraISO || servicoIds.length === 0) {
    return { success: false, error: "Dados incompletos" };
  }

  const dataHora = new Date(dataHoraISO);
  if (Number.isNaN(dataHora.getTime())) {
    return { success: false, error: "Data/hora inválida" };
  }

  const servicos = await prisma.servico.findMany({
    where: {
      id: { in: servicoIds },
      lavaJatoId,
      ativo: true,
    },
  });

  if (servicos.length !== servicoIds.length) {
    return { success: false, error: "Serviços inválidos para este lava-jato" };
  }

  const duracaoTotalMin = servicos.reduce((total, s) => total + s.duracaoMin, 0);
  const precoTotalCentavos = servicos.reduce((total, s) => total + s.precoCentavos, 0);

  try {
    const agendamento = await prisma.$transaction(async (tx) => {
      const disponivel = await horarioDisponivelParaAgendamento(
        lavaJatoId,
        dataHora,
        duracaoTotalMin,
        tx
      );

      if (!disponivel) {
        throw new Error("HORARIO_INDISPONIVEL");
      }

      return tx.agendamento.create({
        data: {
          clienteId: user.id,
          lavaJatoId,
          dataHora,
          duracaoTotalMin,
          precoTotalCentavos,
          status: "PENDENTE",
          servicos: {
            create: servicos.map((s) => ({
              servicoId: s.id,
              precoCentavos: s.precoCentavos,
              duracaoMin: s.duracaoMin,
            })),
          },
        },
      });
    });

    return { success: true, agendamentoId: agendamento.id };
  } catch (e) {
    if (e instanceof Error && e.message === "HORARIO_INDISPONIVEL") {
      return { success: false, error: "Horário não está mais disponível" };
    }
    return { success: false, error: "Erro ao criar agendamento" };
  }
}

export async function cancelarAgendamento(
  agendamentoId: string
): Promise<{ success: true } | { success: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Faça login para cancelar" };
  }

  const agendamento = await prisma.agendamento.findFirst({
    where: {
      id: agendamentoId,
      clienteId: user.id,
      status: { in: ["PENDENTE", "CONFIRMADO"] },
    },
  });

  if (!agendamento) {
    return { success: false, error: "Agendamento não encontrado" };
  }

  if (agendamento.dataHora <= new Date()) {
    return { success: false, error: "Não é possível cancelar agendamentos passados" };
  }

  const diffMs = agendamento.dataHora.getTime() - Date.now();
  const canceladoTarde = diffMs < 30 * 60 * 1000;

  await prisma.agendamento.update({
    where: { id: agendamentoId },
    data: {
      status: "CANCELADO",
      canceladoTarde,
    },
  });

  revalidatePath("/reservas");
  revalidatePath("/painel");

  return { success: true };
}

export async function cancelarAgendamentoSubmit(agendamentoId: string): Promise<void> {
  await cancelarAgendamento(agendamentoId);
}
