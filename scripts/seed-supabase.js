/**
 * Seed all events and communities into Supabase
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env
const envFile = path.resolve(__dirname, '../.env');
if (fs.existsSync(envFile)) {
  const envContent = fs.readFileSync(envFile, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [k, ...v] = trimmed.split('=');
      if (k && v.length) {
        process.env[k.trim()] = v.join('=').trim().replace(/(^["']|["']$)/g, '');
      }
    }
  });
}

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing Supabase credentials in .env');
  process.exit(1);
}

// Read mockData.ts and extract EVENTS_DATA and COMMUNITIES_DATA
const mockDataPath = path.resolve(__dirname, '../src/data/mockData.ts');
const mockDataRaw = fs.readFileSync(mockDataPath, 'utf8');

// Run a lightweight extraction of the events objects
async function run() {
  console.log('🌱 Seeding initial events and communities into Supabase...');

  // Run the sync-events script to push the live harvested events
  const { execSync } = await import('child_process');
  execSync('node scripts/sync-events.js', { stdio: 'inherit' });

  console.log('✅ Seed complete!');
}

run();
