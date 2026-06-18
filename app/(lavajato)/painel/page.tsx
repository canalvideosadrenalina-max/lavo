import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { toggleDisponivelAgora, aceitarAgendamento, recusarAgendamento } from "./actions";
import { DIAS_SEMANA } from "@/lib/lavajato-form";
import { WaveDivider } from "@/components/ui/wave-divider";

function formatarPreco(centavos: number) {
  return (centavos / 100).toFixed(2).replace(".", ",");
}

function formatarDataHora(data: Date) {
  return data.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function PainelHome() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const hojeInicio = new Date();
  hojeInicio.setHours(0, 0, 0, 0);
  const hojeFim = new Date();
  hojeFim.setHours(23, 59, 59, 999);

  const lavaJato = await prisma.lavaJato.findUnique({
    where: { ownerId: user.id },
    include: {
      servicos: {
        where: { ativo: true },
        include: { tipoServico: true },
        orderBy: { tipoServico: { ordem: "asc" } },
      },
      disponibilidades: { orderBy: { diaSemana: "asc" } },
      agendamentos: {
        where: {
          OR: [
            { status: "PENDENTE" },
            {
              status: "CONFIRMADO",
              dataHora: { gte: hojeInicio, lte: hojeFim },
            },
          ],
        },
        include: {
          cliente: true,
          servicos: {
            include: {
              servico: { include: { tipoServico: true } },
            },
          },
        },
        orderBy: { dataHora: "asc" },
      },
    },
  });

  if (!lavaJato) redirect("/painel/cadastro");

  const pendentes = lavaJato.agendamentos.filter((a) => a.status === "PENDENTE");
  const confirmadosHoje = lavaJato.agendamentos.filter((a) => a.status === "CONFIRMADO");

  const labelDia = (dia: number) => DIAS_SEMANA.find((d) => d.dia === dia)?.label ?? "";

  return (
    <main className="lavo-container max-w-3xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="lavo-badge w-fit">Painel</p>
          <h1 className="mt-2 text-3xl font-semibold text-primary">{lavaJato.nome}</h1>
          <p className="mt-2 text-muted">
            {lavaJato.endereco} — {lavaJato.cidade}/{lavaJato.estado}
          </p>
          <p className="mt-1 text-sm text-muted">
            {lavaJato.tipoDocumento}: {lavaJato.documento}
          </p>
        </div>
        <Link href="/painel/configuracoes" className="lavo-btn-outline">
          Configurações
        </Link>
      </div>

      <section className="lavo-section">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold">Disponível agora</h2>
            <p className="text-sm text-muted">
              {lavaJato.disponivelAgora
                ? "Clientes podem agendar neste momento."
                : "Pausado — você aparece como indisponível agora."}
            </p>
          </div>
          <form action={toggleDisponivelAgora}>
            <button
              type="submit"
              className={`lavo-btn text-white ${
                lavaJato.disponivelAgora ? "bg-primary hover:bg-primary/90" : "bg-foreground/45"
              }`}
            >
              {lavaJato.disponivelAgora ? "Disponível" : "Indisponível"}
            </button>
          </form>
        </div>
        <p className="mt-3 text-sm text-muted">
          Intervalo: {lavaJato.intervaloSlotMin} min · Vagas: {lavaJato.vagasSimultaneas}
        </p>
      </section>

      <WaveDivider />

      <section>
        <h2 className="text-lg font-semibold">Aguardando aprovação</h2>
        {pendentes.length === 0 ? (
          <p className="mt-2 lavo-muted">Nenhum agendamento pendente.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {pendentes.map((a) => (
              <li key={a.id} className="lavo-card space-y-2">
                <div className="flex flex-wrap justify-between gap-2 text-sm">
                  <span className="font-medium">{formatarDataHora(a.dataHora)}</span>
                  <span className="text-primary">R$ {formatarPreco(a.precoTotalCentavos)}</span>
                </div>
                <p className="text-sm">{a.cliente.nome}</p>
                <p className="text-sm text-muted">
                  {a.servicos.map((s) => s.servico.tipoServico.nome).join(", ")}
                </p>
                <div className="flex gap-2 pt-1">
                  <form action={aceitarAgendamento.bind(null, a.id)}>
                    <button type="submit" className="lavo-btn bg-primary text-white hover:bg-primary/90">
                      Aceitar
                    </button>
                  </form>
                  <form action={recusarAgendamento.bind(null, a.id)}>
                    <button type="submit" className="lavo-btn-danger">
                      Recusar
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-semibold">Agenda de hoje</h2>
        {confirmadosHoje.length === 0 ? (
          <p className="mt-2 lavo-muted">Nenhum agendamento confirmado para hoje.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {confirmadosHoje.map((a) => (
              <li key={a.id} className="lavo-card text-sm">
                <div className="flex flex-wrap justify-between gap-2">
                  <span className="font-medium">{formatarDataHora(a.dataHora)}</span>
                  <span className="text-primary">R$ {formatarPreco(a.precoTotalCentavos)}</span>
                </div>
                <p className="mt-1">{a.cliente.nome}</p>
                <p className="text-muted">
                  {a.servicos.map((s) => s.servico.tipoServico.nome).join(", ")} ·{" "}
                  {a.duracaoTotalMin} min
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <WaveDivider />

      <section>
        <h2 className="text-lg font-semibold">Horários da semana</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {lavaJato.disponibilidades.map((d) => (
            <li key={d.id} className="lavo-card py-2">
              <span className="font-medium">{labelDia(d.diaSemana)}: </span>
              {d.aberto ? (
                <>
                  {d.horaAbertura}–{d.horaFechamento}
                  {d.temAlmoco && ` (almoço ${d.almocoInicio}–${d.almocoFim})`}
                </>
              ) : (
                <span className="text-muted">Fechado</span>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-semibold">Serviços</h2>
        <ul className="mt-3 space-y-2">
          {lavaJato.servicos.map((s) => (
            <li key={s.id} className="lavo-card flex justify-between text-sm">
              <span>{s.tipoServico.nome}</span>
              <span className="text-muted">
                R$ {formatarPreco(s.precoCentavos)} · {s.duracaoMin} min
              </span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
