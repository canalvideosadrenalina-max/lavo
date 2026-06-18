import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AgendamentoForm } from "@/components/cliente/agendamento-form";
import { WaveDivider } from "@/components/ui/wave-divider";

export default async function LavaJatoDetalhePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const lavaJato = await prisma.lavaJato.findFirst({
    where: {
      slug,
      status: "ATIVO",
      disponivelAgora: true,
    },
    include: {
      servicos: {
        where: { ativo: true },
        include: { tipoServico: true },
        orderBy: { tipoServico: { ordem: "asc" } },
      },
    },
  });

  if (!lavaJato) notFound();

  const servicos = lavaJato.servicos.map((s) => ({
    id: s.id,
    nome: s.tipoServico.nome,
    precoCentavos: s.precoCentavos,
    duracaoMin: s.duracaoMin,
  }));

  return (
    <main className="lavo-container">
      <Link href="/" className="lavo-link text-sm">
        ← Voltar
      </Link>

      <header className="lavo-card space-y-1">
        <h1 className="text-2xl font-bold text-primary">{lavaJato.nome}</h1>
        <p className="text-muted">{lavaJato.endereco}</p>
        <p className="text-sm text-muted">
          {lavaJato.cidade}/{lavaJato.estado}
        </p>
        {lavaJato.telefone && <p className="text-sm text-foreground/80">Tel: {lavaJato.telefone}</p>}
      </header>

      <WaveDivider />

      {servicos.length === 0 ? (
        <p className="lavo-muted">Este lava-jato ainda não cadastrou serviços.</p>
      ) : (
        <AgendamentoForm lavaJatoId={lavaJato.id} servicos={servicos} />
      )}
    </main>
  );
}
