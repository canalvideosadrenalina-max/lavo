import { prisma } from "@/lib/prisma";
import type { Prisma, PrismaClient } from "@prisma/client";

type Intervalo = { inicio: Date; fim: Date };
type DbClient = PrismaClient | Prisma.TransactionClient;

function intervalosConflitam(a: Intervalo, b: Intervalo): boolean {
  return a.inicio < b.fim && b.inicio < a.fim;
}

function parseDataLocal(data: string): Date {
  const [ano, mes, dia] = data.split("-").map(Number);
  return new Date(ano, mes - 1, dia);
}

function combinarDataHorario(data: Date, horario: string): Date {
  const [hora, minuto] = horario.split(":").map(Number);
  const resultado = new Date(data);
  resultado.setHours(hora, minuto, 0, 0);
  return resultado;
}

function candidatoDentroDoAlmoco(
  candidato: Intervalo,
  almocoInicio: Date,
  almocoFim: Date
): boolean {
  return (
    (candidato.inicio >= almocoInicio && candidato.inicio < almocoFim) ||
    intervalosConflitam(candidato, { inicio: almocoInicio, fim: almocoFim })
  );
}

function gerarCandidatos(
  data: Date,
  horaAbertura: string,
  horaFechamento: string,
  intervaloSlotMin: number
): Date[] {
  const abertura = combinarDataHorario(data, horaAbertura);
  const fechamento = combinarDataHorario(data, horaFechamento);
  const intervaloMs = intervaloSlotMin * 60_000;
  const candidatos: Date[] = [];

  for (
    let atual = abertura.getTime();
    atual <= fechamento.getTime();
    atual += intervaloMs
  ) {
    candidatos.push(new Date(atual));
  }

  return candidatos;
}

export async function obterHorariosDisponiveis(
  lavaJatoId: string,
  dataEscolhida: string | Date,
  duracaoTotalMin: number
): Promise<Date[]> {
  if (duracaoTotalMin <= 0) return [];

  const data =
    typeof dataEscolhida === "string"
      ? parseDataLocal(dataEscolhida)
      : new Date(
          dataEscolhida.getFullYear(),
          dataEscolhida.getMonth(),
          dataEscolhida.getDate()
        );

  const lavaJato = await prisma.lavaJato.findUnique({
    where: { id: lavaJatoId },
    include: {
      disponibilidades: true,
    },
  });

  if (!lavaJato || !lavaJato.disponivelAgora) return [];

  const disponibilidade = lavaJato.disponibilidades.find(
    (d) => d.diaSemana === data.getDay()
  );

  if (!disponibilidade?.aberto || !disponibilidade.horaAbertura || !disponibilidade.horaFechamento) {
    return [];
  }

  const inicioDia = new Date(data);
  inicioDia.setHours(0, 0, 0, 0);
  const fimDia = new Date(data);
  fimDia.setHours(23, 59, 59, 999);

  const agendamentos = await prisma.agendamento.findMany({
    where: {
      lavaJatoId,
      status: { in: ["PENDENTE", "CONFIRMADO"] },
      dataHora: { gte: inicioDia, lte: fimDia },
    },
    select: {
      dataHora: true,
      duracaoTotalMin: true,
    },
  });

  const agendamentosIntervalo: Intervalo[] = agendamentos.map((a) => ({
    inicio: a.dataHora,
    fim: new Date(a.dataHora.getTime() + a.duracaoTotalMin * 60_000),
  }));

  const almoco =
    disponibilidade.temAlmoco && disponibilidade.almocoInicio && disponibilidade.almocoFim
      ? {
          inicio: combinarDataHorario(data, disponibilidade.almocoInicio),
          fim: combinarDataHorario(data, disponibilidade.almocoFim),
        }
      : null;

  const fechamento = combinarDataHorario(data, disponibilidade.horaFechamento);
  const duracaoMs = duracaoTotalMin * 60_000;

  const candidatos = gerarCandidatos(
    data,
    disponibilidade.horaAbertura,
    disponibilidade.horaFechamento,
    lavaJato.intervaloSlotMin
  );

  const livres: Date[] = [];

  for (const inicio of candidatos) {
    const fim = new Date(inicio.getTime() + duracaoMs);
    const intervalo: Intervalo = { inicio, fim };

    if (fim > fechamento) continue;

    if (almoco && candidatoDentroDoAlmoco(intervalo, almoco.inicio, almoco.fim)) continue;

    const conflitos = agendamentosIntervalo.filter((a) =>
      intervalosConflitam(intervalo, a)
    ).length;

    if (conflitos >= lavaJato.vagasSimultaneas) continue;

    livres.push(inicio);
  }

  return livres;
}

function limitesDoDia(data: Date) {
  const inicioDia = new Date(data);
  inicioDia.setHours(0, 0, 0, 0);
  const fimDia = new Date(data);
  fimDia.setHours(23, 59, 59, 999);
  return { inicioDia, fimDia };
}

export async function contarConflitosAgendamento(
  db: DbClient,
  lavaJatoId: string,
  dataHora: Date,
  duracaoTotalMin: number
): Promise<number> {
  const { inicioDia, fimDia } = limitesDoDia(dataHora);
  const intervalo: Intervalo = {
    inicio: dataHora,
    fim: new Date(dataHora.getTime() + duracaoTotalMin * 60_000),
  };

  const agendamentos = await db.agendamento.findMany({
    where: {
      lavaJatoId,
      status: { in: ["PENDENTE", "CONFIRMADO"] },
      dataHora: { gte: inicioDia, lte: fimDia },
    },
    select: {
      dataHora: true,
      duracaoTotalMin: true,
    },
  });

  return agendamentos.filter((a) =>
    intervalosConflitam(intervalo, {
      inicio: a.dataHora,
      fim: new Date(a.dataHora.getTime() + a.duracaoTotalMin * 60_000),
    })
  ).length;
}

export async function horarioDisponivelParaAgendamento(
  lavaJatoId: string,
  dataHora: Date,
  duracaoTotalMin: number,
  db: DbClient = prisma
): Promise<boolean> {
  const lavaJato = await db.lavaJato.findUnique({ where: { id: lavaJatoId } });
  if (!lavaJato) return false;

  const conflitos = await contarConflitosAgendamento(db, lavaJatoId, dataHora, duracaoTotalMin);
  return conflitos < lavaJato.vagasSimultaneas;
}
