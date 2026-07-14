import { readFile } from 'node:fs/promises';

const envData = await readFile('.env', 'utf8');
const env = Object.fromEntries(
  envData
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      const m = line.match(/^([^=]+)=(.*)$/);
      return m ? [m[1], m[2].replace(/^"|"$/g, '')] : null;
    })
    .filter(Boolean),
);
Object.assign(process.env, env);

const { supabaseAdmin } = await import('./src/integrations/supabase/client.server.ts');
console.log('SUPABASE_URL', process.env.SUPABASE_URL);
console.log('SERVICE_KEY', process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 10) + '...');
const res = await supabaseAdmin.from('visits').select('*', { count: 'exact', head: true });
console.log(JSON.stringify(res, null, 2));
