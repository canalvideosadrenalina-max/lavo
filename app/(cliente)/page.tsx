import { prisma } from "@/lib/prisma";
import { HomeScreen } from "@/components/cliente/home-screen";

export default async function ClienteHome({
  searchParams,
}: {
  searchParams: Promise<{ cidade?: string }>;
}) {
  const { cidade } = await searchParams;
  const filtroCidade = cidade?.trim();

  const [lavaJatos, cidadesRows] = await Promise.all([
    prisma.lavaJato.findMany({
      where: {
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
        avaliacaoGoogle: true,
      },
    }),
    prisma.lavaJato.findMany({
      where: { disponivelAgora: true },
      select: { cidade: true },
      distinct: ["cidade"],
      orderBy: { cidade: "asc" },
    }),
  ]);

  const cidades = cidadesRows.map((r) => r.cidade);

  return (
    <HomeScreen
      lavaJatos={lavaJatos}
      cidades={cidades}
      filtroCidade={filtroCidade}
      basePath="/"
    />
  );
}
