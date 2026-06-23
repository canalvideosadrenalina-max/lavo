import { prisma } from "@/lib/prisma";
import { HomeScreen } from "@/components/cliente/home-screen";
import { BottomNav } from "@/components/layout/bottom-nav";

export default async function DemoPage({
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
    <div
      className="flex min-h-dvh flex-1 flex-col bg-[#F0F4F8]"
      style={{ paddingBottom: "calc(4.5rem + env(safe-area-inset-bottom, 0px))" }}
    >
      <main className="flex flex-1 flex-col">
        <HomeScreen
          lavaJatos={lavaJatos}
          cidades={cidades}
          filtroCidade={filtroCidade}
          basePath="/demo"
        />
      </main>
      <BottomNav perfilHref="/login" homeHref="/demo" />
    </div>
  );
}
