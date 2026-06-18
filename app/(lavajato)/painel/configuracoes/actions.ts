"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import {
  limparDocumento,
  parseDisponibilidades,
  parseServicos,
  resumoHorario,
  validarDocumento,
  type DisponibilidadeInput,
} from "@/lib/lavajato-form";
import { redirect } from "next/navigation";
import type { TipoDocumento } from "@prisma/client";

function redirectComErro(mensagem: string): never {
  redirect("/painel/configuracoes?error=" + encodeURIComponent(mensagem));
}

export async function atualizarLavaJato(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const lavaJato = await prisma.lavaJato.findUnique({ where: { ownerId: user.id } });
  if (!lavaJato) redirect("/painel/cadastro");

  const tipoDocumento = formData.get("tipoDocumento") as TipoDocumento;
  const documento = limparDocumento(formData.get("documento") as string);
  const razaoSocial = (formData.get("razaoSocial") as string)?.trim() || null;
  const telefone = limparDocumento((formData.get("telefone") as string) ?? "") || null;
  const nome = (formData.get("nome") as string)?.trim();
  const endereco = (formData.get("endereco") as string)?.trim();
  const cidade = (formData.get("cidade") as string)?.trim();
  const estado = (formData.get("estado") as string)?.trim().toUpperCase();
  const intervaloSlotMin = parseInt(formData.get("intervaloSlotMin") as string, 10);
  const vagasSimultaneas = parseInt(formData.get("vagasSimultaneas") as string, 10);

  if (!validarDocumento(tipoDocumento, documento)) {
    redirectComErro(tipoDocumento === "CNPJ" ? "CNPJ inválido" : "CPF inválido");
  }

  const docEmUso = await prisma.lavaJato.findFirst({
    where: { documento, id: { not: lavaJato.id } },
  });
  if (docEmUso) redirectComErro("Documento já cadastrado");

  let disponibilidades: DisponibilidadeInput[];
  let servicos: Awaited<ReturnType<typeof parseServicos>>;

  try {
    disponibilidades = parseDisponibilidades(formData);
    servicos = parseServicos(formData);
  } catch (e) {
    redirectComErro(e instanceof Error ? e.message : "Dados inválidos");
  }

  const { horaAbertura, horaFechamento } = resumoHorario(disponibilidades);

  await prisma.$transaction(async (tx) => {
    await tx.disponibilidadeSemanal.deleteMany({ where: { lavaJatoId: lavaJato.id } });
    await tx.servico.deleteMany({ where: { lavaJatoId: lavaJato.id } });

    await tx.lavaJato.update({
      where: { id: lavaJato.id },
      data: {
        nome,
        tipoDocumento,
        documento,
        razaoSocial,
        telefone,
        endereco,
        cidade,
        estado,
        horaAbertura,
        horaFechamento,
        intervaloSlotMin,
        vagasSimultaneas,
        disponibilidades: { create: disponibilidades },
        servicos: { create: servicos },
      },
    });
  });

  redirect("/painel/configuracoes?ok=1");
}
