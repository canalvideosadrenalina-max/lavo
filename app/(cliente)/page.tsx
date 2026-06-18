import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { WaveDivider } from "@/components/ui/wave-divider";

export default async function ClienteHome({
  searchParams,
}: {
  searchParams: Promise<{ cidade?: string }>;
}) {
  const { cidade } = await searchParams;
  const filtroCidade = cidade?.trim();

  const lavaJatos = await prisma.lavaJato.findMany({
    where: {
      status: "ATIVO",
      disponivelAgora: true,
      ...(filtroCidade
        ? { cidade: { contains: filtroCidade, mode: "insensitive" } }
        : {}),
    },
    orderBy: { nome: "asc" },
    select: {
      nome: true,
      cidade: true,
      estado: true,
      slug: true,
    },
  });

  return (
    <main className="lavo-container">
      <div>
        <p className="lavo-badge w-fit">Agendamento online</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">Lavo</h1>
        <p className="mt-2 lavo-muted">Encontre um lava-jato e agende seu horário.</p>
      </div>

      <form method="get" className="flex gap-2">
        <input
          name="cidade"
          defaultValue={filtroCidade ?? ""}
          placeholder="Filtrar por cidade"
          className="lavo-input flex-1 text-sm"
        />
        <button type="submit" className="lavo-btn-accent shrink-0">
          Buscar
        </button>
      </form>

      <WaveDivider />

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Lava-jatos disponíveis</h2>
        <Link href="/reservas" className="lavo-link text-sm">
          Minhas reservas
        </Link>
      </div>

      {lavaJatos.length === 0 ? (
        <p className="lavo-muted">
          Nenhum lava-jato disponível{filtroCidade ? ` em "${filtroCidade}"` : ""}.
        </p>
      ) : (
        <ul className="space-y-3">
          {lavaJatos.map((lj) => (
            <li key={lj.slug}>
              <Link
                href={`/lavajato/${lj.slug}`}
                className="lavo-card block transition hover:border-accent/40 hover:shadow-md"
              >
                <span className="font-medium text-primary">{lj.nome}</span>
                <span className="mt-1 block text-sm text-muted">
                  {lj.cidade}/{lj.estado}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
