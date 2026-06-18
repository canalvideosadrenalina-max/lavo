"use client";

import { DIAS_SEMANA } from "@/lib/lavajato-form";

type DiaConfig = {
  diaSemana: number;
  aberto: boolean;
  horaAbertura: string | null;
  horaFechamento: string | null;
  temAlmoco: boolean;
  almocoInicio: string | null;
  almocoFim: string | null;
};

type Props = {
  initial?: DiaConfig[];
};

const DEFAULTS: Record<number, Partial<DiaConfig>> = {
  1: { aberto: true, horaAbertura: "08:00", horaFechamento: "18:00", temAlmoco: true, almocoInicio: "12:00", almocoFim: "13:00" },
  2: { aberto: true, horaAbertura: "08:00", horaFechamento: "18:00", temAlmoco: true, almocoInicio: "12:00", almocoFim: "13:00" },
  3: { aberto: true, horaAbertura: "08:00", horaFechamento: "18:00", temAlmoco: true, almocoInicio: "12:00", almocoFim: "13:00" },
  4: { aberto: true, horaAbertura: "08:00", horaFechamento: "18:00", temAlmoco: true, almocoInicio: "12:00", almocoFim: "13:00" },
  5: { aberto: true, horaAbertura: "08:00", horaFechamento: "18:00", temAlmoco: true, almocoInicio: "12:00", almocoFim: "13:00" },
  6: { aberto: true, horaAbertura: "08:00", horaFechamento: "12:00", temAlmoco: false },
  0: { aberto: false },
};

function getDia(dia: number, initial?: DiaConfig[]): DiaConfig {
  const saved = initial?.find((d) => d.diaSemana === dia);
  const fallback = DEFAULTS[dia] ?? { aberto: false };
  return {
    diaSemana: dia,
    aberto: saved?.aberto ?? fallback.aberto ?? false,
    horaAbertura: saved?.horaAbertura ?? fallback.horaAbertura ?? "08:00",
    horaFechamento: saved?.horaFechamento ?? fallback.horaFechamento ?? "18:00",
    temAlmoco: saved?.temAlmoco ?? fallback.temAlmoco ?? false,
    almocoInicio: saved?.almocoInicio ?? fallback.almocoInicio ?? "12:00",
    almocoFim: saved?.almocoFim ?? fallback.almocoFim ?? "13:00",
  };
}

export function DisponibilidadeSemanalForm({ initial }: Props) {
  return (
    <div className="space-y-3">
      {DIAS_SEMANA.map(({ dia, label }) => {
        const config = getDia(dia, initial);
        return (
          <fieldset key={dia} className="rounded-lg border border-border p-3 space-y-3">
            <label className="flex items-center gap-2 font-medium">
              <input
                type="checkbox"
                name={`aberto_${dia}`}
                defaultChecked={config.aberto}
                className="accent-primary"
              />
              {label}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="lavo-label">
                Abre
                <input
                  name={`horaAbertura_${dia}`}
                  type="time"
                  defaultValue={config.horaAbertura ?? "08:00"}
                  className="lavo-input mt-1"
                />
              </label>
              <label className="lavo-label">
                Fecha
                <input
                  name={`horaFechamento_${dia}`}
                  type="time"
                  defaultValue={config.horaFechamento ?? "18:00"}
                  className="lavo-input mt-1"
                />
              </label>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name={`temAlmoco_${dia}`}
                defaultChecked={config.temAlmoco}
                className="accent-primary"
              />
              Horário de almoço
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="lavo-label">
                Almoço início
                <input
                  name={`almocoInicio_${dia}`}
                  type="time"
                  defaultValue={config.almocoInicio ?? "12:00"}
                  className="lavo-input mt-1"
                />
              </label>
              <label className="lavo-label">
                Almoço fim
                <input
                  name={`almocoFim_${dia}`}
                  type="time"
                  defaultValue={config.almocoFim ?? "13:00"}
                  className="lavo-input mt-1"
                />
              </label>
            </div>
          </fieldset>
        );
      })}
    </div>
  );
}
