import * as dotenv from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env.local') });

const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

if (!API_KEY) {
  console.error('GOOGLE_MAPS_API_KEY não definido em .env.local');
  process.exit(1);
}

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
  { nome: "Lava-Jato Eldorado 1", cidade: "Eldorado do Sul" },
  { nome: "Lava-Jato Eldorado 2", cidade: "Eldorado do Sul" },
  { nome: "Lava-Jato Eldorado 3", cidade: "Eldorado do Sul" },
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

async function testarApiKey() {
  console.log('=== TESTE DA API KEY ===');
  const query = 'lava jato Guaíba RS Brasil';
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  console.log('HTTP status:', res.status);
  console.log('Google status:', data.status);
  if (data.error_message) {
    console.log('Google error_message:', data.error_message);
  }
  if (data.status !== 'OK') {
    console.log('Resposta completa:', JSON.stringify(data, null, 2));
  } else {
    console.log('Resultados no teste:', data.results?.length ?? 0);
  }
  console.log('');
}

async function pesquisar(nome, cidade) {
  const query = `${nome} ${cidade} RS Brasil`;
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${API_KEY}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.status === 'OK' && data.results.length > 0) {
      const place = data.results[0];
      const status = place.permanently_closed || place.business_status === 'CLOSED_PERMANENTLY'
        ? 'INATIVO'
        : place.business_status === 'OPERATIONAL'
        ? 'ATIVO'
        : 'INCERTO';
      return {
        status,
        rating: place.rating || null,
        endereco: place.formatted_address || '',
        place_id: place.place_id || '',
        business_status: place.business_status || '',
      };
    }
    return { status: 'NAO_ENCONTRADO', rating: null, endereco: '', place_id: '', business_status: '' };
  } catch(e) {
    return { status: 'ERRO', rating: null, endereco: e.message, place_id: '', business_status: '' };
  }
}

async function run() {
  await testarApiKey();

  const limit = Number(process.env.LIMIT) || lavajatos.length;
  const lista = lavajatos.slice(0, limit);

  console.log(`Iniciando validação (${lista.length} de ${lavajatos.length})...\n`);
  const resultados = [];

  for (let i = 0; i < lista.length; i++) {
    const lj = lista[i];
    process.stdout.write(`[${i+1}/${lista.length}] ${lj.nome} (${lj.cidade})... `);
    const res = await pesquisar(lj.nome, lj.cidade);
    console.log(res.status + (res.rating ? ` ⭐${res.rating}` : ''));
    resultados.push({ ...lj, ...res });
    await new Promise(r => setTimeout(r, 300));
  }

  const ativos = resultados.filter(r => r.status === 'ATIVO');
  const inativos = resultados.filter(r => r.status === 'INATIVO');
  const incertos = resultados.filter(r => r.status === 'INCERTO' || r.status === 'NAO_ENCONTRADO');

  console.log('\n=== RESULTADO ===');
  console.log(`ATIVOS: ${ativos.length}`);
  console.log(`INATIVOS: ${inativos.length}`);
  console.log(`INCERTOS/NÃO ENCONTRADOS: ${incertos.length}`);

  console.log('\n--- ATIVOS ---');
  ativos.forEach(r => console.log(`✅ ${r.nome} | ${r.endereco} | ⭐${r.rating}`));

  console.log('\n--- INATIVOS ---');
  inativos.forEach(r => console.log(`❌ ${r.nome}`));

  console.log('\n--- INCERTOS ---');
  incertos.forEach(r => console.log(`⚠️  ${r.nome} | ${r.status}`));

  fs.writeFileSync('scripts/prospects-validados.json', JSON.stringify(resultados, null, 2));
  console.log('\nResultado salvo em scripts/prospects-validados.json');
}

run();
