"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
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
  redirect("/painel/cadastro?error=" + encodeURIComponent(mensagem));
}

export async function cadastrarLavaJato(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const existente = await prisma.lavaJato.findUnique({ where: { ownerId: user.id } });
  if (existente) redirect("/painel");

  const tipoDocumento = formData.get("tipoDocumento") as TipoDocumento;
  const documentoRaw = formData.get("documento") as string;
  const documento = limparDocumento(documentoRaw);
  const razaoSocial = (formData.get("razaoSocial") as string)?.trim() || null;
  const telefone = limparDocumento((formData.get("telefone") as string) ?? "") || null;
  const nome = (formData.get("nome") as string)?.trim();
  const endereco = (formData.get("endereco") as string)?.trim();
  const cidade = (formData.get("cidade") as string)?.trim();
  const estado = (formData.get("estado") as string)?.trim().toUpperCase();
  const intervaloSlotMin = parseInt(formData.get("intervaloSlotMin") as string, 10);
  const vagasSimultaneas = parseInt(formData.get("vagasSimultaneas") as string, 10);

  if (!nome || !endereco || !cidade || !estado) {
    redirectComErro("Preencha todos os campos do estabelecimento");
  }

  if (!tipoDocumento || !validarDocumento(tipoDocumento, documento)) {
    redirectComErro(tipoDocumento === "CNPJ" ? "CNPJ inválido" : "CPF inválido");
  }

  if (tipoDocumento === "CNPJ" && !razaoSocial) {
    redirectComErro("Informe a razão social para CNPJ");
  }

  if (Number.isNaN(intervaloSlotMin) || intervaloSlotMin < 15) {
    redirectComErro("Intervalo mínimo entre horários: 15 minutos");
  }

  if (Number.isNaN(vagasSimultaneas) || vagasSimultaneas < 1) {
    redirectComErro("Informe pelo menos 1 vaga simultânea");
  }

  const docEmUso = await prisma.lavaJato.findUnique({ where: { documento } });
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

  let slug = slugify(nome);
  if (await prisma.lavaJato.findUnique({ where: { slug } })) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  await prisma.lavaJato.create({
    data: {
      ownerId: user.id,
      nome,
      slug,
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
      disponivelAgora: true,
      status: "ATIVO",
      disponibilidades: { create: disponibilidades },
      servicos: { create: servicos },
    },
  });

  redirect("/painel");
}
