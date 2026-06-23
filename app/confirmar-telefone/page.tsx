import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ConfirmarTelefoneForms } from "@/components/confirmar-telefone/confirmar-telefone-forms";

function mascararTelefone(telefone: string) {
  const d = telefone.replace(/\D/g, "");
  if (d.length < 4) return telefone;
  return `••••${d.slice(-4)}`;
}

export default async function ConfirmarTelefonePage({
  searchParams,
}: {
  searchParams: Promise<{ returnUrl?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { returnUrl } = await searchParams;
  const returnUrlSeguro =
    returnUrl?.startsWith("/") && !returnUrl.startsWith("//") ? returnUrl : null;

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });

  if (!dbUser) {
    redirect("/login");
  }

  if (dbUser.telefoneConfirmado) {
    redirect(returnUrlSeguro ?? (dbUser.role === "LAVAJATO" ? "/painel/cadastro" : "/"));
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <ConfirmarTelefoneForms
        telefoneMascarado={mascararTelefone(dbUser.telefone)}
        returnUrl={returnUrlSeguro}
      />
    </main>
  );
}
