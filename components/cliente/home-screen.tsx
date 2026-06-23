import Link from "next/link";
import { WaterDrop } from "@/components/ui/water-drop";

export type LavaJatoCard = {
  nome: string;
  cidade: string;
  estado: string;
  slug: string;
};

type Props = {
  lavaJatos: LavaJatoCard[];
  cidades: string[];
  filtroCidade?: string;
  basePath?: string;
};

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
    <div className="flex flex-1 flex-col px-4 pt-4">
      <h1 className="text-xl font-bold text-[#0F172A]">Olá! Onde quer lavar seu carro?</h1>

      <form id="buscar" method="get" action={basePath} className="mt-4 scroll-mt-4">
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]">
            🔍
          </span>
          <input
            name="cidade"
            defaultValue={cidadeAtiva}
            placeholder="Buscar cidade ou lava-jato..."
            className="w-full rounded-2xl border border-[#E2E8F0] bg-white py-3.5 pl-10 pr-4 text-sm text-[#0F172A] shadow-sm placeholder:text-[#64748B] focus:border-[#06B6D4] focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/25"
          />
        </div>
      </form>

      <div className="mt-4 -mx-4 overflow-x-auto px-4 pb-1">
        <div className="flex w-max gap-2">
          <Link
            href={basePath}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
              !cidadeAtiva
                ? "bg-[#06B6D4] text-white"
                : "bg-white text-[#64748B] shadow-sm"
            }`}
          >
            Todos
          </Link>
          {cidades.map((cidade) => (
            <Link
              key={cidade}
              href={cidadeHref(cidade)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
                cidadeAtiva.toLowerCase() === cidade.toLowerCase()
                  ? "bg-[#06B6D4] text-white"
                  : "bg-white text-[#64748B] shadow-sm"
              }`}
            >
              {cidade}
            </Link>
          ))}
        </div>
      </div>

      <ul className="mt-5 flex flex-1 flex-col gap-4 pb-4">
        {lavaJatos.length === 0 ? (
          <li className="rounded-2xl bg-white p-6 text-center text-sm text-[#64748B] shadow-sm">
            Nenhum lava-jato disponível{cidadeAtiva ? ` em "${cidadeAtiva}"` : ""}.
          </li>
        ) : (
          lavaJatos.map((lj) => (
            <li key={lj.slug}>
              <article className="overflow-hidden rounded-2xl bg-white shadow-md">
                <div className="relative h-36 bg-gradient-to-br from-[#06B6D4] to-[#1E3A5F] px-4 pb-3">
                  <div className="flex h-full flex-col items-center justify-center">
                    <WaterDrop size={32} className="text-white" />
                    <h2 className="mt-2 line-clamp-2 text-center text-lg font-bold leading-tight text-white">
                      {lj.nome}
                    </h2>
                  </div>
                  <p className="absolute bottom-3 left-4 text-xs text-white/70">{lj.cidade}</p>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-end">
                    <span className="shrink-0 rounded-lg bg-[#F0F4F8] px-2 py-1 text-xs font-semibold text-[#0F172A]">
                      ★ 4.8
                    </span>
                  </div>
                  <Link
                    href={`/lavajato/${lj.slug}`}
                    className="mt-4 flex w-full items-center justify-center rounded-xl bg-[#06B6D4] py-3 text-sm font-semibold text-white transition hover:bg-[#0E7490]"
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
