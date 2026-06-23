import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AgendamentoForm } from "@/components/cliente/agendamento-form";

export default async function LavaJatoDetalhePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const lavaJato = await prisma.lavaJato.findFirst({
    where: {
      slug,
      disponivelAgora: true,
    },
    include: {
      servicos: {
        where: { ativo: true },
        include: { tipoServico: true },
        orderBy: [{ tipoServico: { categoria: "asc" } }, { tipoServico: { ordem: "asc" } }],
      },
    },
  });

  if (!lavaJato) notFound();

  const servicos = lavaJato.servicos.map((s) => ({
    id: s.id,
    nome: s.tipoServico.nome,
    categoria: s.tipoServico.categoria,
    ordem: s.tipoServico.ordem,
    precoCentavos: s.precoCentavos,
    duracaoMin: s.duracaoMin,
  }));

  return (
    <div className="flex flex-1 flex-col pb-28">
      <div className="bg-[#1E3A5F] px-4 py-5 sm:px-6">
        <div className="mx-auto max-w-2xl">
          <Link
            href="/"
            className="mb-3 inline-block text-sm font-medium text-white/70 transition hover:text-white"
          >
            ← Voltar
          </Link>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">{lavaJato.nome}</h1>
          <p className="mt-1 text-sm font-medium text-[#06B6D4]">
            {lavaJato.cidade}/{lavaJato.estado}
          </p>
          {lavaJato.endereco && (
            <p className="mt-2 text-sm text-white/75">{lavaJato.endereco}</p>
          )}
          {lavaJato.telefone && (
            <p className="mt-1 text-sm text-white/75">Tel: {lavaJato.telefone}</p>
          )}
        </div>
      </div>

      <div className="flex-1 bg-[#F0F4F8] px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-2xl space-y-6">
          {servicos.length === 0 ? (
            <p className="text-sm text-[#64748B]">Este lava-jato ainda não cadastrou serviços.</p>
          ) : (
            <AgendamentoForm lavaJatoId={lavaJato.id} servicos={servicos} />
          )}

          <section className="w-full rounded-2xl bg-[#06B6D4] p-6 text-white shadow-lg">
            <div className="flex items-start gap-4">
              <span className="text-4xl leading-none" aria-hidden>
                🏪
              </span>
              <div className="flex flex-1 flex-col gap-3">
                <h2 className="text-xl font-bold text-white">Você é o dono deste estabelecimento?</h2>
                <p className="text-sm leading-relaxed text-white/95">
                  Seu negócio já está no LaVo. Faça seu cadastro gratuito e comece a receber
                  agendamentos online hoje mesmo.
                </p>
                <Link
                  href={`/cadastro?slug=${slug}&role=lavajato`}
                  className="mt-1 inline-flex w-full items-center justify-center rounded-xl bg-white px-5 py-3 text-center text-sm font-semibold text-[#06B6D4] transition hover:bg-white/90"
                >
                  Quero me cadastrar gratuitamente
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
