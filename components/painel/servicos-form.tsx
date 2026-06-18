import type { TipoServico } from "@prisma/client";

type ServicoComTipo = {
  tipoServicoId: string;
  precoCentavos: number;
  duracaoMin: number;
};

export function ServicosForm({
  tipos,
  selecionados = [],
}: {
  tipos: TipoServico[];
  selecionados?: ServicoComTipo[];
}) {
  const mapa = new Map(selecionados.map((s) => [s.tipoServicoId, s]));

  return (
    <ul className="space-y-4">
      {tipos.map((tipo) => {
        const saved = mapa.get(tipo.id);
        return (
          <li key={tipo.id} className="rounded-lg border border-border p-3 space-y-3">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                name="tipo"
                value={tipo.id}
                defaultChecked={!!saved}
                className="mt-1 accent-primary"
              />
              <span>
                <span className="font-medium">{tipo.nome}</span>
                {tipo.descricao && (
                  <span className="block text-sm text-muted">{tipo.descricao}</span>
                )}
              </span>
            </label>
            <div className="grid grid-cols-2 gap-3 pl-7">
              <label className="lavo-label">
                Preço (R$)
                <input
                  name={`preco_${tipo.id}`}
                  placeholder="40,00"
                  defaultValue={
                    saved ? (saved.precoCentavos / 100).toFixed(2).replace(".", ",") : undefined
                  }
                  className="lavo-input mt-1"
                />
              </label>
              <label className="lavo-label">
                Duração (min)
                <input
                  name={`duracao_${tipo.id}`}
                  type="number"
                  min={5}
                  step={5}
                  defaultValue={saved?.duracaoMin ?? 30}
                  className="lavo-input mt-1"
                />
              </label>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
