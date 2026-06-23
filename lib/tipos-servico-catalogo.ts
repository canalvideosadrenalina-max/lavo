export const CATEGORIAS_ORDEM = [
  "LAVAGEM BÁSICA",
  "LIMPEZA INTERNA",
  "POLIMENTO E PROTEÇÃO",
  "MOTOR E CHASSI",
  "VIDROS",
  "SERVIÇOS ESPECIAIS",
] as const;

export type CategoriaServico = (typeof CATEGORIAS_ORDEM)[number];

export const DURACAO_PADRAO_POR_SLUG: Record<string, number> = {
  "lavagem-simples": 30,
  "lavagem-completa": 60,
  "lavagem-a-seco": 45,
  "lavagem-ecologica-vapor": 50,
  "higienizacao-interna-completa": 90,
  "limpeza-estofados-bancos": 60,
  "higienizacao-carpetes": 45,
  "limpeza-teto": 30,
  "sanitizacao-ozonio": 45,
  "polimento-simples": 120,
  "polimento-cristalizacao": 180,
  enceramento: 60,
  "vitrificacao-pintura": 240,
  "pretinho-pneus-plasticos": 20,
  "lavagem-motor": 45,
  "lavagem-chassi": 40,
  "limpeza-vidros": 20,
  "repelente-agua": 30,
  "revitalizacao-farois": 45,
  "higienizacao-ar-condicionado": 60,
  "impermeabilizacao-estofados": 90,
  "nano-ceramica": 300,
};

export function duracaoPadraoTipo(slug: string): number {
  return DURACAO_PADRAO_POR_SLUG[slug] ?? 30;
}

export function groupByCategoria<T extends { categoria: string; ordem: number }>(
  items: T[]
): { categoria: string; items: T[] }[] {
  const map = new Map<string, T[]>();

  for (const item of items) {
    const list = map.get(item.categoria) ?? [];
    list.push(item);
    map.set(item.categoria, list);
  }

  const categorias = [...map.keys()].sort((a, b) => {
    const ia = CATEGORIAS_ORDEM.indexOf(a as CategoriaServico);
    const ib = CATEGORIAS_ORDEM.indexOf(b as CategoriaServico);
    if (ia === -1 && ib === -1) return a.localeCompare(b, "pt-BR");
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });

  return categorias.map((categoria) => ({
    categoria,
    items: (map.get(categoria) ?? []).sort((a, b) => a.ordem - b.ordem),
  }));
}
