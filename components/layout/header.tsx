import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { signOut } from "@/app/actions/auth";
import { WaterDrop } from "@/components/ui/water-drop";

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role: "CLIENTE" | "LAVAJATO" | null = null;
  if (user) {
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    role = dbUser?.role ?? "CLIENTE";
  }

  return (
    <header className="sticky top-0 z-50 bg-[#1E3A5F] shadow-md">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-2 text-white">
          <WaterDrop size={28} className="shrink-0 text-[#06B6D4]" />
          <span className="font-display truncate text-xl font-bold tracking-tight">Lavo</span>
        </Link>

        <nav className="flex shrink-0 items-center gap-2 text-sm sm:gap-3">
          {!user ? (
            <>
              <Link
                href="/login"
                className="font-medium text-white/90 transition hover:text-white"
              >
                Entrar
              </Link>
              <Link
                href="/cadastro"
                className="rounded-lg bg-[#06B6D4] px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-[#0E7490]"
              >
                Cadastrar
              </Link>
            </>
          ) : role === "LAVAJATO" ? (
            <>
              <Link
                href="/painel"
                className="font-medium text-white/90 transition hover:text-white"
              >
                Painel
              </Link>
              <form action={signOut}>
                <button
                  type="submit"
                  className="rounded-lg border border-white/25 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  Sair
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/reservas"
                className="font-medium text-white/90 transition hover:text-white"
              >
                Reservas
              </Link>
              <form action={signOut}>
                <button
                  type="submit"
                  className="rounded-lg border border-white/25 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  Sair
                </button>
              </form>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
