import Link from "next/link";
import { WaterDrop } from "@/components/ui/water-drop";

export type LavaJatoCard = {
  nome: string;
  cidade: string;
  estado: string;
  slug: string;
  avaliacaoGoogle?: number | null;
};

type Props = {
  lavaJatos: LavaJatoCard[];
  cidades: string[];
  filtroCidade?: string;
  basePath?: string;
};

function formatarAvaliacao(nota: number) {
  return nota.toFixed(1).replace(".", ",");
}

export function HomeScreen({
  lavaJatos,
  cidades,
  filtroCidade,
  basePath = "/",
}: Props) {
  const cidadeAtiva = filtroCidade ?? "";

  function cidadeHref(cidade: string) {
    if (!cidade) return basePath;
    const params = new URLSearchParams({ cidade });
    return `${basePath}?${params.toString()}`;
  }

  return (
    <div className="flex flex-1 flex-col px-4 pt-5 pb-2">
      <h1 className="text-[1.35rem] font-bold leading-tight tracking-tight text-[#0F172A] sm:text-xl">
        Olá! Onde quer lavar seu carro?
      </h1>
      <p className="mt-1 text-sm text-[#64748B]">Encontre lava-jatos disponíveis perto de você</p>

      <form id="buscar" method="get" action={basePath} className="mt-5 scroll-mt-4">
        <div className="relative">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]">
            🔍
          </span>
          <input
            name="cidade"
            defaultValue={cidadeAtiva}
            placeholder="Buscar cidade ou lava-jato..."
            className="lavo-input min-h-[48px] rounded-2xl py-3.5 pl-11 pr-4 text-sm shadow-sm"
          />
        </div>
      </form>

      <div className="mt-4 -mx-4 overflow-x-auto px-4 pb-1">
        <div className="flex w-max gap-2">
          <Link
            href={basePath}
            className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-medium transition-colors duration-200 ${
              !cidadeAtiva
                ? "bg-[#06B6D4] text-white shadow-sm"
                : "bg-white text-[#64748B] shadow-sm hover:text-[#0F172A]"
            }`}
          >
            Todos
          </Link>
          {cidades.map((cidade) => (
            <Link
              key={cidade}
              href={cidadeHref(cidade)}
              className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-medium transition-colors duration-200 ${
                cidadeAtiva.toLowerCase() === cidade.toLowerCase()
                  ? "bg-[#06B6D4] text-white shadow-sm"
                  : "bg-white text-[#64748B] shadow-sm hover:text-[#0F172A]"
              }`}
            >
              {cidade}
            </Link>
          ))}
        </div>
      </div>

      <ul className="mt-5 flex flex-1 flex-col gap-4 pb-4">
        {lavaJatos.length === 0 ? (
          <li className="rounded-2xl bg-white p-8 text-center text-sm text-[#64748B] shadow-sm">
            Nenhum lava-jato disponível{cidadeAtiva ? ` em "${cidadeAtiva}"` : ""}.
          </li>
        ) : (
          lavaJatos.map((lj) => (
            <li key={lj.slug}>
              <article className="lavo-card-home">
                <div className="relative h-40 bg-gradient-to-br from-[#06B6D4] via-[#0891b2] to-[#1E3A5F] px-4 pb-3">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.18),transparent_45%)]" />
                  <div className="relative flex h-full flex-col items-center justify-center">
                    <WaterDrop size={36} className="text-white drop-shadow-sm" />
                    <h2 className="mt-2 line-clamp-2 px-2 text-center text-lg font-bold leading-tight text-white">
                      {lj.nome}
                    </h2>
                  </div>
                  <p className="absolute bottom-3 left-4 text-xs font-medium text-white/80">
                    {lj.cidade}/{lj.estado}
                  </p>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-[#64748B]">Serviços disponíveis</span>
                    {lj.avaliacaoGoogle != null ? (
                      <span className="shrink-0 rounded-lg bg-[#F0F4F8] px-2.5 py-1 text-xs font-semibold text-[#0F172A]">
                        ★ {formatarAvaliacao(lj.avaliacaoGoogle)}
                      </span>
                    ) : (
                      <span className="shrink-0 rounded-lg bg-[#F0F4F8] px-2.5 py-1 text-xs font-medium text-[#64748B]">
                        Novo
                      </span>
                    )}
                  </div>
                  <Link
                    href={`/lavajato/${lj.slug}`}
                    className="lavo-btn-primary mt-4 min-h-[48px] py-3 text-sm"
                  >
                    Ver serviços
                  </Link>
                </div>
              </article>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
