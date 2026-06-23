import { atualizarLavaJato } from "./actions";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { DisponibilidadeSemanalForm } from "@/components/painel/disponibilidade-semanal-form";
import { ServicosForm } from "@/components/painel/servicos-form";
import { FormWithToast } from "@/components/ui/form-with-toast";

export default async function ConfiguracoesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const lavaJato = await prisma.lavaJato.findUnique({
    where: { ownerId: user.id },
    include: {
      disponibilidades: { orderBy: { diaSemana: "asc" } },
      servicos: true,
    },
  });

  if (!lavaJato) redirect("/painel/cadastro");

  const tipos = await prisma.tipoServico.findMany({
    orderBy: [{ categoria: "asc" }, { ordem: "asc" }],
  });

  return (
    <main className="lavo-container max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="lavo-badge w-fit">Painel</p>
          <h1 className="mt-2 text-2xl font-bold text-primary">Configurações</h1>
          <p className="mt-1 lavo-muted">Atualize dados, horários e serviços.</p>
        </div>
        <Link href="/painel" className="lavo-link text-sm">
          Voltar
        </Link>
      </div>

      <FormWithToast action={atualizarLavaJato} className="space-y-8">
        <section className="lavo-section">
          <h2 className="font-semibold">Identificação</h2>
          <select
            name="tipoDocumento"
            defaultValue={lavaJato.tipoDocumento}
            required
            className="lavo-input"
          >
            <option value="CPF">Pessoa física (CPF)</option>
            <option value="CNPJ">Pessoa jurídica (CNPJ)</option>
          </select>
          <input name="documento" defaultValue={lavaJato.documento} required className="lavo-input" />
          <input
            name="razaoSocial"
            defaultValue={lavaJato.razaoSocial ?? ""}
            placeholder="Razão social"
            className="lavo-input"
          />
          <input
            name="telefone"
            defaultValue={lavaJato.telefone ?? ""}
            placeholder="Telefone"
            className="lavo-input"
          />
        </section>

        <section className="lavo-section">
          <h2 className="font-semibold">Estabelecimento</h2>
          <input name="nome" defaultValue={lavaJato.nome} required className="lavo-input" />
          <input name="endereco" defaultValue={lavaJato.endereco} required className="lavo-input" />
          <div className="grid grid-cols-2 gap-3">
            <input name="cidade" defaultValue={lavaJato.cidade} required className="lavo-input" />
            <input
              name="estado"
              defaultValue={lavaJato.estado}
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
              <select
                name="intervaloSlotMin"
                defaultValue={String(lavaJato.intervaloSlotMin)}
                className="lavo-input mt-1"
              >
                <option value="15">15 min</option>
                <option value="30">30 min</option>
                <option value="45">45 min</option>
                <option value="60">60 min</option>
              </select>
            </label>
            <label className="lavo-label">
              Vagas simultâneas
              <input
                name="vagasSimultaneas"
                type="number"
                min={1}
                max={20}
                defaultValue={lavaJato.vagasSimultaneas}
                required
                className="lavo-input mt-1"
              />
            </label>
          </div>
        </section>

        <section className="lavo-section">
          <h2 className="font-semibold">Disponibilidade semanal</h2>
          <DisponibilidadeSemanalForm initial={lavaJato.disponibilidades} />
        </section>

        <section className="lavo-section">
          <h2 className="font-semibold">Serviços e preços</h2>
          <ServicosForm
            tipos={tipos}
            selecionados={lavaJato.servicos.map((s) => ({
              tipoServicoId: s.tipoServicoId,
              precoCentavos: s.precoCentavos,
              duracaoMin: s.duracaoMin,
            }))}
          />
        </section>

        <button type="submit" className="lavo-btn-primary">
          Salvar alterações
        </button>
      </FormWithToast>
    </main>
  );
}
