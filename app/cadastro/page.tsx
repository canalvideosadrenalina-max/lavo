import Link from "next/link";
import { signup } from "./actions";
import { WaveDivider } from "@/components/ui/wave-divider";

export default async function CadastroPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <form action={signup} className="lavo-section w-full max-w-sm space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Criar conta</h1>
          <p className="mt-1 lavo-muted">Cliente ou dono de lava-jato</p>
        </div>
        <WaveDivider className="-mx-1" />
        {error && <p className="lavo-alert-error">{error}</p>}
        <input name="nome" placeholder="Nome" required className="lavo-input" />
        <input name="telefone" type="tel" placeholder="WhatsApp (DDD + número)" required className="lavo-input" />
        <input name="email" type="email" placeholder="Email" required className="lavo-input" />
        <input
          name="password"
          type="password"
          placeholder="Senha"
          required
          minLength={6}
          className="lavo-input"
        />
        <select name="role" required className="lavo-input">
          <option value="CLIENTE">Sou cliente</option>
          <option value="LAVAJATO">Sou dono de lava-jato</option>
        </select>
        <button type="submit" className="lavo-btn-primary">
          Cadastrar
        </button>
        <p className="text-center text-sm text-muted">
          Já tem conta?{" "}
          <Link href="/login" className="lavo-link">
            Entrar
          </Link>
        </p>
      </form>
    </main>
  );
}
