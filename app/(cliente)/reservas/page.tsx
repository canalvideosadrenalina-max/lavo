import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { cancelarAgendamentoSubmit } from "../actions";
import { WaveDivider } from "@/components/ui/wave-divider";

function formatarPreco(centavos: number) {
  return (centavos / 100).toFixed(2).replace(".", ",");
}

function formatarDataHora(data: Date) {
  return data.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const STATUS_LABEL: Record<string, string> = {
  PENDENTE: "Aguardando confirmação",
  CONFIRMADO: "Confirmado",
  CONCLUIDO: "Concluído",
  CANCELADO: "Cancelado",
};

export default async function ReservasPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const agora = new Date();

  const agendamentos = await prisma.agendamento.findMany({
    where: { clienteId: user.id },
    include: {
      lavaJato: true,
      servicos: {
        include: {
          servico: { include: { tipoServico: true } },
        },
      },
    },
    orderBy: { dataHora: "desc" },
  });

  return (
    <main className="lavo-container">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Minhas reservas</h1>
          <p className="mt-1 lavo-muted">Histórico e agendamentos futuros</p>
        </div>
        <Link href="/" className="lavo-link text-sm">
          Lava-jatos
        </Link>
      </div>

      <WaveDivider />

      {agendamentos.length === 0 ? (
        <p className="lavo-muted">Você ainda não fez nenhum agendamento.</p>
      ) : (
        <ul className="space-y-4">
          {agendamentos.map((a) => {
            const podeCancelar =
              (a.status === "PENDENTE" || a.status === "CONFIRMADO") && a.dataHora > agora;

            return (
              <li key={a.id} className="lavo-card space-y-2">
                <div className="flex flex-wrap justify-between gap-2">
                  <span className="font-medium text-primary">{a.lavaJato.nome}</span>
                  <span className="lavo-badge">{STATUS_LABEL[a.status]}</span>
                </div>
                <p className="text-sm">{formatarDataHora(a.dataHora)}</p>
                <p className="text-sm text-muted">
                  {a.servicos.map((s) => s.servico.tipoServico.nome).join(", ")}
                </p>
                <p className="text-sm font-medium">R$ {formatarPreco(a.precoTotalCentavos)}</p>
                {a.canceladoTarde && (
                  <p className="rounded-lg bg-sun/15 px-2 py-1 text-xs text-foreground">
                    Cancelado com menos de 30 min de antecedência
                  </p>
                )}
                {podeCancelar && (
                  <form action={cancelarAgendamentoSubmit.bind(null, a.id)}>
                    <button type="submit" className="lavo-btn-danger mt-1">
                      Cancelar
                    </button>
                  </form>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
