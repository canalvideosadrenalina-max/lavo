import { cadastrarLavaJato } from "./actions";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DisponibilidadeSemanalForm } from "@/components/painel/disponibilidade-semanal-form";
import { ServicosForm } from "@/components/painel/servicos-form";

export default async function CadastroLavaJatoPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  if (await prisma.lavaJato.findUnique({ where: { ownerId: user.id } })) {
    redirect("/painel");
  }

  const tipos = await prisma.tipoServico.findMany({
    orderBy: [{ categoria: "asc" }, { ordem: "asc" }],
  });
  const { error } = await searchParams;

  return (
    <main className="lavo-container max-w-2xl">
      <div>
        <p className="lavo-badge w-fit">Painel</p>
        <h1 className="mt-2 text-2xl font-bold text-primary">Cadastro do lava-jato</h1>
        <p className="mt-1 lavo-muted">
          Configure identificação, horários, capacidade e serviços oferecidos.
        </p>
      </div>

      {error && <p className="lavo-alert-error">{error}</p>}

      <form action={cadastrarLavaJato} className="space-y-8">
        <section className="lavo-section">
          <h2 className="font-semibold">Identificação</h2>
          <select name="tipoDocumento" required className="lavo-input">
            <option value="CPF">Pessoa física (CPF)</option>
            <option value="CNPJ">Pessoa jurídica (CNPJ)</option>
          </select>
          <input
            name="documento"
            placeholder="CPF ou CNPJ (somente números)"
            required
            className="lavo-input"
          />
          <input
            name="razaoSocial"
            placeholder="Razão social (obrigatório para CNPJ)"
            className="lavo-input"
          />
          <input name="telefone" placeholder="Telefone / WhatsApp" className="lavo-input" />
        </section>

        <section className="lavo-section">
          <h2 className="font-semibold">Estabelecimento</h2>
          <input name="nome" placeholder="Nome fantasia" required className="lavo-input" />
          <input name="endereco" placeholder="Endereço completo" required className="lavo-input" />
          <div className="grid grid-cols-2 gap-3">
            <input name="cidade" placeholder="Cidade" required className="lavo-input" />
            <input
              name="estado"
              placeholder="UF"
              required
              maxLength={2}
              className="lavo-input uppercase"
            />
          </div>
        </section>

        <section className="lavo-section">
          <h2 className="font-semibold">Capacidade operacional</h2>
          <div className="grid grid-cols-2 gap-3">
            <label className="lavo-label">
              Intervalo entre horários (min)
              <select name="intervaloSlotMin" defaultValue="30" className="lavo-input mt-1">
                <option value="15">15 min</option>
                <option value="30">30 min</option>
                <option value="45">45 min</option>
                <option value="60">60 min</option>
              </select>
            </label>
            <label className="lavo-label">
              Vagas simultâneas (boxes)
              <input
                name="vagasSimultaneas"
                type="number"
                min={1}
                max={20}
                defaultValue={1}
                required
                className="lavo-input mt-1"
              />
            </label>
          </div>
        </section>

        <section className="lavo-section">
          <h2 className="font-semibold">Disponibilidade semanal</h2>
          <p className="lavo-muted">Marque os dias abertos, horários e pausa para almoço.</p>
          <DisponibilidadeSemanalForm />
        </section>

        <section className="lavo-section">
          <h2 className="font-semibold">Serviços e preços</h2>
          {tipos.length === 0 ? (
            <p className="lavo-alert-success">Catálogo vazio. Rode: npx prisma db seed</p>
          ) : (
            <ServicosForm tipos={tipos} />
          )}
        </section>

        <button type="submit" className="lavo-btn-primary">
          Salvar cadastro
        </button>
      </form>
    </main>
  );
}
