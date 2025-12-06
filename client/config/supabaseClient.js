// client/config/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

console.log('=== AMBIENTE ATUAL ===');
console.log('Modo:', import.meta.env.MODE);
console.log('Base URL:', import.meta.env.BASE_URL);
console.log('Pasta atual (import.meta.url):', import.meta.url);

// Lista TODAS as variáveis VITE
const viteEnvVars = Object.keys(import.meta.env).filter(key => key.startsWith('VITE_'));
console.log('Variáveis VITE disponíveis:', viteEnvVars);

// Mostra valores (ocultando chaves longas)
viteEnvVars.forEach(key => {
  const value = import.meta.env[key];
  if (key.includes('KEY') && value && value.length > 20) {
    console.log(`${key}: ***${value.slice(-4)}`);
  } else {
    console.log(`${key}:`, value);
  }
});

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('\n=== VALORES SUPABASE ===');
console.log('URL:', supabaseUrl);
console.log('Key existe?', !!supabaseKey);
console.log('Comprimento da key:', supabaseKey ? supabaseKey.length : 0);

if (!supabaseUrl) {
  console.error('❌ ERRO: VITE_SUPABASE_URL está UNDEFINED');
  console.error('Possíveis causas:');
  console.error('1. Arquivo .env não está na pasta client/');
  console.error('2. Variável não começa com VITE_');
  console.error('3. Servidor Vite não foi reiniciado após criar .env');
  console.error('4. Cache do Vite precisa ser limpo');
  
  throw new Error('VITE_SUPABASE_URL não está definida. Verifique o arquivo .env na pasta client/');
}

if (!supabaseKey) {
  console.error('❌ ERRO: VITE_SUPABASE_ANON_KEY está UNDEFINED');
  throw new Error('VITE_SUPABASE_ANON_KEY não está definida. Verifique o arquivo .env na pasta client/');
}

console.log('✅ Variáveis carregadas com sucesso!');
console.log('URL (início):', supabaseUrl.substring(0, 50) + '...');

const supabase = createClient(supabaseUrl, supabaseKey);
console.log('✅ Cliente Supabase criado!');

export default supabase;