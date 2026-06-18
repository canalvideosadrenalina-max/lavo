"use client";

import { useState } from "react";
import { buscarHorariosDisponiveis, criarAgendamento } from "@/app/(cliente)/actions";
import { WaveDivider } from "@/components/ui/wave-divider";

type ServicoItem = {
  id: string;
  nome: string;
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
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  function toggleServico(id: string) {
    setSelecionados((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  async function handleVerHorarios() {
    setMensagem(null);
    setErro(null);
    setHorarios([]);

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

  async function handleAgendar(horarioISO: string) {
    setMensagem(null);
    setErro(null);
    setCarregando(true);

    const resultado = await criarAgendamento(lavaJatoId, horarioISO, selecionados);
    setCarregando(false);

    if (resultado.success) {
      setMensagem("Agendamento enviado, aguardando confirmação do lava-jato");
      setHorarios([]);
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

  return (
    <section className="space-y-6">
      <div className="lavo-section">
        <h2 className="text-lg font-semibold">Serviços</h2>
        <ul className="mt-3 space-y-2">
          {servicos.map((s) => (
            <li key={s.id}>
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 transition hover:border-accent/30">
                <input
                  type="checkbox"
                  checked={selecionados.includes(s.id)}
                  onChange={() => toggleServico(s.id)}
                  className="mt-1 accent-primary"
                />
                <span className="flex-1 text-sm">
                  <span className="font-medium">{s.nome}</span>
                  <span className="mt-0.5 block text-muted">
                    R$ {formatarPreco(s.precoCentavos)} · {s.duracaoMin} min
                  </span>
                </span>
              </label>
            </li>
          ))}
        </ul>
        {selecionados.length > 0 && (
          <p className="mt-3 text-sm font-medium text-primary">
            Total: R$ {formatarPreco(totalCentavos)} · {totalMin} min
          </p>
        )}
      </div>

      <WaveDivider />

      <div className="lavo-section space-y-3">
        <label className="lavo-label">
          Data
          <input
            type="date"
            value={data}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => setData(e.target.value)}
            className="lavo-input mt-1"
          />
        </label>
        <button
          type="button"
          onClick={handleVerHorarios}
          disabled={carregando}
          className="lavo-btn-primary"
        >
          {carregando ? "Carregando..." : "Ver horários"}
        </button>
      </div>

      {erro && <p className="lavo-alert-error">{erro}</p>}
      {mensagem && <p className="lavo-alert-success">{mensagem}</p>}

      {horarios.length > 0 && (
        <div className="lavo-section">
          <h3 className="text-sm font-semibold">Horários disponíveis</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {horarios.map((h) => (
              <button
                key={h}
                type="button"
                disabled={carregando}
                onClick={() => handleAgendar(h)}
                className="lavo-btn-slot px-3 py-2"
              >
                {formatarHorario(h)}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
