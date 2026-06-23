import { prisma } from "@/lib/prisma";
import { CadastroForm } from "./cadastro-form";

export default async function CadastroPage({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string; role?: string }>;
}) {
  const { slug, role } = await searchParams;
  const slugParam = slug?.trim() ?? "";
  const assumirPerfil = role?.toLowerCase() === "lavajato" && !!slugParam;

  const lavaJato = assumirPerfil
    ? await prisma.lavaJato.findFirst({
        where: { slug: slugParam },
        select: { nome: true },
      })
    : null;

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-[#F0F4F8] p-4">
      <div className="w-full max-w-sm space-y-4">
        <CadastroForm
          assumirPerfil={assumirPerfil}
          lavaJatoNome={lavaJato?.nome}
          slugParam={slugParam}
        />
      </div>
    </main>
  );
}
