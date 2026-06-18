import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { confirmarTelefone, reenviarCodigoTelefone } from "./actions";
import { WaveDivider } from "@/components/ui/wave-divider";

function mascararTelefone(telefone: string) {
  const d = telefone.replace(/\D/g, "");
  if (d.length < 4) return telefone;
  return `••••${d.slice(-4)}`;
}

export default async function ConfirmarTelefonePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });

  if (!dbUser) {
    redirect("/login?error=Usuário não encontrado.");
  }

  if (dbUser.telefoneConfirmado) {
    redirect(dbUser.role === "LAVAJATO" ? "/painel/cadastro" : "/");
  }

  const { error, ok } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="lavo-section w-full max-w-sm space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Confirmar telefone</h1>
          <p className="mt-1 lavo-muted">
            Enviamos um código de 6 dígitos no WhatsApp para{" "}
            <span className="font-medium text-foreground">{mascararTelefone(dbUser.telefone)}</span>
          </p>
        </div>
        <WaveDivider className="-mx-1" />
        {error && <p className="lavo-alert-error">{error}</p>}
        {ok && <p className="lavo-alert-success">{ok}</p>}
        <form action={confirmarTelefone} className="space-y-4">
          <label className="lavo-label">
            Código de verificação
            <input
              name="codigo"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              placeholder="000000"
              className="lavo-input mt-1 text-center text-lg tracking-[0.3em]"
            />
          </label>
          <button type="submit" className="lavo-btn-primary">
            Confirmar
          </button>
        </form>
        <form action={reenviarCodigoTelefone}>
          <button type="submit" className="lavo-btn-outline w-full">
            Reenviar código
          </button>
        </form>
      </div>
    </main>
  );
}
