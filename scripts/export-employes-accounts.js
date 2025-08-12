import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from '../server/database/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function formatDate(dt = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return (
    dt.getFullYear().toString() +
    pad(dt.getMonth() + 1) +
    pad(dt.getDate()) + '-' +
    pad(dt.getHours()) +
    pad(dt.getMinutes()) +
    pad(dt.getSeconds())
  );
}

function toCsvValue(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function buildCsv(rows) {
  const headers = [
    'entreprise',
    'entreprise_email',
    'employe_id',
    'prenom',
    'nom',
    'email',
    'telephone',
    'fonction',
    'password',
    'password_is_hashed'
  ];
  const lines = [headers.join(',')];
  for (const r of rows) {
    const isHashed = typeof r.password === 'string' && r.password.startsWith('$2b$');
    lines.push([
      toCsvValue(r.entreprise),
      toCsvValue(r.entreprise_email),
      toCsvValue(r.id),
      toCsvValue(r.prenom),
      toCsvValue(r.nom),
      toCsvValue(r.email),
      toCsvValue(r.telephone),
      toCsvValue(r.fonction),
      toCsvValue(isHashed ? '' : (r.password || '')),
      toCsvValue(isHashed ? 'true' : 'false')
    ].join(','));
  }
  return lines.join('\n');
}

function getAllEmployeAccounts() {
  const stmt = db.prepare(`
    SELECT 
      e.id,
      e.prenom,
      e.nom,
      e.email,
      e.telephone,
      e.fonction,
      e.password,
      ent.raison_sociale AS entreprise,
      ent.email AS entreprise_email
    FROM employes e
    JOIN entreprises ent ON e.entreprise_id = ent.id
    ORDER BY ent.raison_sociale ASC, e.nom ASC, e.prenom ASC
  `);
  return stmt.all();
}

function ensureDir(targetDir) {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
}

async function main() {
  try {
    const rows = getAllEmployeAccounts();
    const argSet = new Set(process.argv.slice(2));
    const outputDir = path.join(__dirname, '..', 'exports');
    ensureDir(outputDir);
    const filename = `employes-accounts-${formatDate()}.csv`;
    const filepath = path.join(outputDir, filename);

    const csv = buildCsv(rows);
    fs.writeFileSync(filepath, csv, 'utf-8');

    // Optional outputs
    if (argSet.has('--stdout')) {
      console.log(csv);
    }
    if (argSet.has('--json')) {
      console.log(JSON.stringify(rows, null, 2));
    }

    console.log(`✅ Exported ${rows.length} employe accounts to: ${filepath}`);
    console.log('ℹ️ Note: password column is blank when the stored value is hashed.');
  } catch (error) {
    console.error('❌ Failed to export employe accounts:', error.message);
    process.exitCode = 1;
  }
}

main();








