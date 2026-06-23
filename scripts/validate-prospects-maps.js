import { chromium } from 'playwright';
import fs from 'fs';

const lavajatos = [
  { nome: "TF Estética Automotiva", cidade: "Guaíba" },
  { nome: "Lavagem Von Muhlen", cidade: "Guaíba" },
  { nome: "Belm Go Eco Wash Customização", cidade: "Guaíba" },
  { nome: "Limpocar Lava a Seco", cidade: "Guaíba" },
  { nome: "Lavagem Original Car", cidade: "Guaíba" },
  { nome: "Belo's Lavagem", cidade: "Guaíba" },
  { nome: "Lavagem 2 Irmãos", cidade: "Guaíba" },
  { nome: "Less Lavagem Ecológica", cidade: "Guaíba" },
  { nome: "Roger Pereira Ramos", cidade: "Guaíba" },
  { nome: "Auto Center Guaíba", cidade: "Guaíba" },
  { nome: "Maia Polimento", cidade: "Guaíba" },
  { nome: "Vini Estética Automotiva", cidade: "Guaíba" },
  { nome: "Lavagem da Magdinha", cidade: "Guaíba" },
  { nome: "Lavagem do Toni", cidade: "Guaíba" },
  { nome: "Lavagem Guaíba", cidade: "Guaíba" },
  { nome: "Posto Arrastão", cidade: "Guaíba" },
  { nome: "Abastecedora Rioxel", cidade: "Guaíba" },
  { nome: "Lavagem do Cheiroso", cidade: "Guaíba" },
  { nome: "Lava Rápido Americano", cidade: "Canoas" },
  { nome: "Jatos Car", cidade: "Canoas" },
  { nome: "JC Lavagem", cidade: "Canoas" },
  { nome: "DouglasDetail Estética Automotiva", cidade: "Canoas" },
  { nome: "Fox Wash Lavagem", cidade: "Canoas" },
  { nome: "Lavagem São João", cidade: "Canoas" },
  { nome: "Parcão Estética Automotiva", cidade: "Canoas" },
  { nome: "Lavagem Porto Belo", cidade: "Canoas" },
  { nome: "Estéticar Lavagem Automotiva", cidade: "Canoas" },
  { nome: "Lava-Rápido Gaspar Lemos", cidade: "Canoas" },
  { nome: "Lava-Rápido Rua dos Buritis", cidade: "Canoas" },
  { nome: "Lava-Rápido Rua Caramuru", cidade: "Canoas" },
  { nome: "Lava-Rápido Rua Camaquã", cidade: "Canoas" },
  { nome: "Lava-Rápido Capistrano de Abreu", cidade: "Canoas" },
  { nome: "Lava-Rápido Rua Tupanciretã", cidade: "Canoas" },
  { nome: "Lava-Rápido Santini Longoni", cidade: "Canoas" },
  { nome: "Lava-Rápido Guajuviras", cidade: "Canoas" },
  { nome: "Lava-Rápido Av. Ozanan", cidade: "Canoas" },
];

async function pesquisar(page, nome, cidade) {
  const query = `${nome} ${cidade} RS`;
  const url = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(2000);
    const content = await page.content();
    const fechado = content.includes('Permanentemente fechado') || content.includes('permanently closed');
    const found = content.includes('place') && !content.includes('Nenhum resultado');
    const rating = content.match(/"(\d\.\d)" estrelas/) || content.match(/(\d\.\d) \(/);
    const endereco = content.match(/·\s([^·<]{10,60}),\s(RS|Rio Grande)/);
    if (fechado) return { status: 'INATIVO', rating: null, endereco: '' };
    if (found) return { status: 'ATIVO', rating: rating ? rating[1] : null, endereco: endereco ? endereco[1] : '' };
    return { status: 'NAO_ENCONTRADO', rating: null, endereco: '' };
  } catch(e) {
    return { status: 'ERRO', rating: null, endereco: e.message.substring(0, 50) };
  }
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setExtraHTTPHeaders({ 'Accept-Language': 'pt-BR,pt;q=0.9' });
  
  console.log('Iniciando validação via Google Maps...\n');
  const resultados = [];

  for (let i = 0; i < lavajatos.length; i++) {
    const lj = lavajatos[i];
    process.stdout.write(`[${i+1}/${lavajatos.length}] ${lj.nome} (${lj.cidade})... `);
    const res = await pesquisar(page, lj.nome, lj.cidade);
    console.log(res.status + (res.rating ? ` ⭐${res.rating}` : '') + (res.endereco ? ` | ${res.endereco}` : ''));
    resultados.push({ ...lj, ...res });
    await page.waitForTimeout(1500);
  }

  await browser.close();

  const ativos = resultados.filter(r => r.status === 'ATIVO');
  const inativos = resultados.filter(r => r.status === 'INATIVO');
  const naoEncontrados = resultados.filter(r => r.status === 'NAO_ENCONTRADO');

  console.log(`\n=== RESULTADO ===`);
  console.log(`ATIVOS: ${ativos.length}`);
  console.log(`INATIVOS: ${inativos.length}`);
  console.log(`NÃO ENCONTRADOS: ${naoEncontrados.length}`);
  console.log('\n--- ATIVOS ---');
  ativos.forEach(r => console.log(`✅ ${r.nome} | ${r.cidade} | ⭐${r.rating || 'sem nota'} | ${r.endereco}`));
  console.log('\n--- INATIVOS ---');
  inativos.forEach(r => console.log(`❌ ${r.nome}`));
  console.log('\n--- NÃO ENCONTRADOS ---');
  naoEncontrados.forEach(r => console.log(`⚠️  ${r.nome}`));

  fs.writeFileSync('scripts/prospects-validados.json', JSON.stringify(resultados, null, 2));
  console.log('\nResultado salvo em scripts/prospects-validados.json');
}

run();
