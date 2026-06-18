import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { signOut } from "@/app/actions/auth";

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
    <header className="sticky top-0 z-50 border-b border-border bg-surface/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-xl font-bold tracking-tight text-primary">
          Lavo
        </Link>

        <nav className="flex items-center gap-3 text-sm">
          {!user ? (
            <>
              <Link href="/login" className="lavo-link font-medium">
                Entrar
              </Link>
              <Link href="/cadastro" className="lavo-btn-outline">
                Cadastrar
              </Link>
            </>
          ) : role === "LAVAJATO" ? (
            <>
              <Link href="/painel" className="lavo-link font-medium">
                Painel
              </Link>
              <form action={signOut}>
                <button type="submit" className="lavo-btn-outline">
                  Sair
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/reservas" className="lavo-link font-medium">
                Minhas reservas
              </Link>
              <form action={signOut}>
                <button type="submit" className="lavo-btn-outline">
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
