"use client";

import { useState } from "react";
import { buscarHorariosDisponiveis, criarAgendamento } from "@/app/(cliente)/actions";
import { groupByCategoria } from "@/lib/tipos-servico-catalogo";

type ServicoItem = {
  id: string;
  nome: string;
  categoria: string;
  ordem: number;
  precoCentavos: number;
  duracaoMin: number;
};

type Props = {
  lavaJatoId: string;
  servicos: ServicoItem[];
};

function formatarPreco(centavos: number) {
  return (centavos / 100).toFixed(2).replace(".", ",");
}

function formatarHorario(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AgendamentoForm({ lavaJatoId, servicos }: Props) {
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [data, setData] = useState("");
  const [horarios, setHorarios] = useState<string[]>([]);
  const [horarioSelecionado, setHorarioSelecionado] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const grupos = groupByCategoria(servicos);

  function toggleServico(id: string) {
    setSelecionados((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
    setHorarioSelecionado(null);
    setHorarios([]);
  }

  async function handleVerHorarios() {
    setMensagem(null);
    setErro(null);
    setHorarios([]);
    setHorarioSelecionado(null);

    if (selecionados.length === 0) {
      setErro("Selecione pelo menos um serviço");
      return;
    }
    if (!data) {
      setErro("Selecione uma data");
      return;
    }

    setCarregando(true);
    const resultado = await buscarHorariosDisponiveis(lavaJatoId, data, selecionados);
    setCarregando(false);

    if (resultado.error) {
      setErro(resultado.error);
      return;
    }

    if (resultado.horarios.length === 0) {
      setErro("Nenhum horário disponível para esta data");
      return;
    }

    setHorarios(resultado.horarios);
  }

  async function handleConfirmar() {
    if (!horarioSelecionado) return;

    setMensagem(null);
    setErro(null);
    setCarregando(true);

    const resultado = await criarAgendamento(lavaJatoId, horarioSelecionado, selecionados);
    setCarregando(false);

    if (resultado.success) {
      setMensagem("Agendamento enviado, aguardando confirmação do lava-jato");
      setHorarios([]);
      setHorarioSelecionado(null);
      return;
    }

    setErro(resultado.error);
  }

  const totalCentavos = servicos
    .filter((s) => selecionados.includes(s.id))
    .reduce((acc, s) => acc + s.precoCentavos, 0);
  const totalMin = servicos
    .filter((s) => selecionados.includes(s.id))
    .reduce((acc, s) => acc + s.duracaoMin, 0);

  const mostrarBarra = selecionados.length > 0;

  return (
    <>
      <section className="space-y-4">
        <div className="rounded-2xl bg-white p-5 shadow-md">
          <h2 className="text-lg font-semibold text-[#0F172A]">Serviços</h2>
          <div className="mt-4 space-y-5">
            {grupos.map(({ categoria, items }) => (
              <div key={categoria} className="space-y-2">
                <h3 className="text-sm font-bold uppercase tracking-wide text-[#06B6D4]">
                  {categoria}
                </h3>
                <ul className="space-y-2">
                  {items.map((s) => (
                    <li key={s.id}>
                      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#E2E8F0] bg-white p-3 transition hover:border-[#06B6D4]/40">
                        <input
                          type="checkbox"
                          checked={selecionados.includes(s.id)}
                          onChange={() => toggleServico(s.id)}
                          className="mt-1 accent-[#06B6D4]"
                        />
                        <span className="flex-1 text-sm">
                          <span className="font-medium text-[#0F172A]">{s.nome}</span>
                          <span className="mt-0.5 block text-[#64748B]">
                            R$ {formatarPreco(s.precoCentavos)} · {s.duracaoMin} min
                          </span>
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-md">
          <label className="block text-sm font-medium text-[#0F172A]">
            Data
            <input
              type="date"
              value={data}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => {
                setData(e.target.value);
                setHorarioSelecionado(null);
                setHorarios([]);
              }}
              className="lavo-input mt-2 shadow-sm"
            />
          </label>
          <button
            type="button"
            onClick={handleVerHorarios}
            disabled={carregando}
            className="mt-4 w-full rounded-xl bg-[#06B6D4] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0E7490] disabled:opacity-50"
          >
            {carregando ? "Carregando..." : "Ver horários"}
          </button>
        </div>

        {erro && <p className="text-sm text-red-600">{erro}</p>}
        {mensagem && (
          <p className="rounded-xl border border-[#06B6D4]/30 bg-[#06B6D4]/10 px-4 py-3 text-sm text-[#0F172A]">
            {mensagem}
          </p>
        )}

        {horarios.length > 0 && (
          <div className="rounded-2xl bg-white p-5 shadow-md">
            <h3 className="text-sm font-semibold text-[#0F172A]">Horários disponíveis</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {horarios.map((h) => {
                const selecionado = horarioSelecionado === h;
                return (
                  <button
                    key={h}
                    type="button"
                    disabled={carregando}
                    onClick={() => setHorarioSelecionado(h)}
                    className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition disabled:opacity-50 ${
                      selecionado
                        ? "border-[#06B6D4] bg-[#06B6D4] text-white"
                        : "border-[#CBD5E1] bg-white text-[#0F172A] hover:border-[#06B6D4]"
                    }`}
                  >
                    {formatarHorario(h)}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {mostrarBarra && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#1E3A5F] px-4 py-4 shadow-[0_-4px_20px_rgba(15,23,42,0.15)]">
          <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
            <div className="min-w-0 text-white">
              <p className="text-xs text-white/70">Total estimado</p>
              <p className="truncate text-base font-bold">
                R$ {formatarPreco(totalCentavos)} · {totalMin} min
              </p>
              {horarioSelecionado && (
                <p className="text-xs text-[#06B6D4]">{formatarHorario(horarioSelecionado)}</p>
              )}
            </div>
            <button
              type="button"
              onClick={handleConfirmar}
              disabled={carregando || !horarioSelecionado}
              className="shrink-0 rounded-xl bg-[#06B6D4] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0E7490] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {carregando ? "..." : "Confirmar"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
