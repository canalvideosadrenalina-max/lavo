import Link from "next/link";
import { login } from "./actions";
import { WaveDivider } from "@/components/ui/wave-divider";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; info?: string }>;
}) {
  const { error, info } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <form action={login} className="lavo-section w-full max-w-sm space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Entrar</h1>
          <p className="mt-1 lavo-muted">Acesse sua conta Lavo</p>
        </div>
        <WaveDivider className="-mx-1" />
        {error && <p className="lavo-alert-error">{error}</p>}
        {info && <p className="lavo-alert-success">{info}</p>}
        <input name="email" type="email" placeholder="Email" required className="lavo-input" />
        <input name="password" type="password" placeholder="Senha" required className="lavo-input" />
        <button type="submit" className="lavo-btn-primary">
          Entrar
        </button>
        <p className="text-center text-sm text-muted">
          Não tem conta?{" "}
          <Link href="/cadastro" className="lavo-link">
            Cadastre-se
          </Link>
        </p>
      </form>
    </main>
  );
}
