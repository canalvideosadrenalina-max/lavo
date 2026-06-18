import type { TipoDocumento } from "@prisma/client";

export const DIAS_SEMANA = [
  { dia: 1, label: "Segunda-feira" },
  { dia: 2, label: "Terça-feira" },
  { dia: 3, label: "Quarta-feira" },
  { dia: 4, label: "Quinta-feira" },
  { dia: 5, label: "Sexta-feira" },
  { dia: 6, label: "Sábado" },
  { dia: 0, label: "Domingo" },
] as const;

export function limparDocumento(valor: string): string {
  return valor.replace(/\D/g, "");
}

export function validarDocumento(tipo: TipoDocumento, valor: string): boolean {
  const doc = limparDocumento(valor);
  return tipo === "CPF" ? doc.length === 11 : doc.length === 14;
}

export function parsePrecoCentavos(reais: string): number {
  const normalizado = reais.replace(",", ".").trim();
  const valor = parseFloat(normalizado);
  if (Number.isNaN(valor) || valor <= 0) {
    throw new Error("Preço inválido");
  }
  return Math.round(valor * 100);
}

export type DisponibilidadeInput = {
  diaSemana: number;
  aberto: boolean;
  horaAbertura: string | null;
  horaFechamento: string | null;
  temAlmoco: boolean;
  almocoInicio: string | null;
  almocoFim: string | null;
};

export function parseDisponibilidades(formData: FormData): DisponibilidadeInput[] {
  const result: DisponibilidadeInput[] = [];

  for (const { dia } of DIAS_SEMANA) {
    const aberto = formData.get(`aberto_${dia}`) === "on";
    const horaAbertura = (formData.get(`horaAbertura_${dia}`) as string) || null;
    const horaFechamento = (formData.get(`horaFechamento_${dia}`) as string) || null;
    const temAlmoco = formData.get(`temAlmoco_${dia}`) === "on";
    const almocoInicio = (formData.get(`almocoInicio_${dia}`) as string) || null;
    const almocoFim = (formData.get(`almocoFim_${dia}`) as string) || null;

    if (aberto && (!horaAbertura || !horaFechamento)) {
      throw new Error(`Informe horário de abertura e fechamento para ${dia}`);
    }

    if (aberto && temAlmoco && (!almocoInicio || !almocoFim)) {
      throw new Error(`Informe horário de almoço para ${dia}`);
    }

    result.push({
      diaSemana: dia,
      aberto,
      horaAbertura: aberto ? horaAbertura : null,
      horaFechamento: aberto ? horaFechamento : null,
      temAlmoco: aberto && temAlmoco,
      almocoInicio: aberto && temAlmoco ? almocoInicio : null,
      almocoFim: aberto && temAlmoco ? almocoFim : null,
    });
  }

  if (!result.some((d) => d.aberto)) {
    throw new Error("Informe pelo menos um dia de funcionamento");
  }

  return result;
}

export function parseServicos(formData: FormData) {
  const tiposSelecionados = formData.getAll("tipo") as string[];

  if (tiposSelecionados.length === 0) {
    throw new Error("Selecione pelo menos um serviço");
  }

  return tiposSelecionados.map((tipoId) => {
    const preco = formData.get(`preco_${tipoId}`) as string;
    const duracao = formData.get(`duracao_${tipoId}`) as string;
    const duracaoMin = parseInt(duracao, 10);

    if (!preco || Number.isNaN(duracaoMin) || duracaoMin <= 0) {
      throw new Error("Informe preço e duração para cada serviço selecionado");
    }

    return {
      tipoServicoId: tipoId,
      precoCentavos: parsePrecoCentavos(preco),
      duracaoMin,
    };
  });
}

export function resumoHorario(disponibilidades: DisponibilidadeInput[]) {
  const primeiroAberto = disponibilidades.find((d) => d.aberto);
  return {
    horaAbertura: primeiroAberto?.horaAbertura ?? "08:00",
    horaFechamento: primeiroAberto?.horaFechamento ?? "18:00",
  };
}
