import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { WaveDivider } from "@/components/ui/wave-divider";

function mascararTelefone(telefone: string) {
  const d = telefone.replace(/\D/g, "");
  if (d.length < 8) return telefone || "—";
  return `(${d.slice(0, 2)}) •••••-${d.slice(-4)}`;
}

export default async function PerfilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });

  if (!dbUser) {
    redirect("/login");
  }

  if (dbUser.role === "LAVAJATO") {
    redirect("/painel");
  }

  const telefoneOk = dbUser.telefoneConfirmado;

  return (
    <div className="flex flex-1 flex-col px-4 pt-5 pb-4">
      <h1 className="text-xl font-bold text-[#0F172A]">Meu perfil</h1>
      <p className="mt-1 text-sm text-[#64748B]">Dados da sua conta Lavo</p>

      <div className="lavo-section mt-5 space-y-4">
        <WaveDivider className="-mx-1" />

        <dl className="space-y-4">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-[#64748B]">Nome</dt>
            <dd className="mt-1 text-base font-medium text-[#0F172A]">{dbUser.nome}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-[#64748B]">Email</dt>
            <dd className="mt-1 text-base text-[#0F172A]">{dbUser.email}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-[#64748B]">WhatsApp</dt>
            <dd className="mt-1 text-base text-[#0F172A]">{mascararTelefone(dbUser.telefone)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-[#64748B]">Telefone confirmado</dt>
            <dd className="mt-1">
              {telefoneOk ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
                  ✓ Confirmado
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700">
                  Pendente
                </span>
              )}
            </dd>
          </div>
        </dl>

        {!telefoneOk && (
          <Link href="/confirmar-telefone?returnUrl=/perfil" className="lavo-btn-primary min-h-[48px] py-3 text-sm">
            Confirmar telefone
          </Link>
        )}

        <Link href="/reservas" className="lavo-btn-outline min-h-[48px] w-full py-3 text-sm">
          Ver minhas reservas
        </Link>
      </div>
    </div>
  );
}
