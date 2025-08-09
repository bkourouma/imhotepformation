import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Utility to load .env into key-value (without mutating process.env)
function loadEnvFile(envPath) {
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, 'utf8');
  const lines = content.split(/\r?\n/);
  const data = {};
  for (const line of lines) {
    if (!line || line.trim().startsWith('#')) continue;
    const idx = line.indexOf('=');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    data[key] = value;
  }
  return data;
}

function serializeEnv(data) {
  return Object.entries(data)
    .map(([k, v]) => `${k}=${String(v ?? '')}`)
    .join('\n') + '\n';
}

router.get('/', (req, res) => {
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    const data = loadEnvFile(envPath);
    // Only expose safe keys
    const allowedKeys = [
      'NODE_ENV',
      'PORT',
      'SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_SECURE', 'SMTP_FROM',
      'TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_WHATSAPP_FROM',
      'OPENAI_API_KEY',
      'FORCE_PRODUCTION'
    ];
    const filtered = Object.fromEntries(
      Object.entries(data).filter(([k]) => allowedKeys.includes(k))
    );
    res.json(filtered);
  } catch (e) {
    console.error('Settings GET error:', e);
    res.status(500).json({ error: 'Erreur lecture paramètres' });
  }
});

router.put('/', express.json(), (req, res) => {
  try {
    const updates = req.body || {};
    const envPath = path.resolve(process.cwd(), '.env');
    const current = loadEnvFile(envPath);
    const next = { ...current, ...updates };
    fs.writeFileSync(envPath, serializeEnv(next), 'utf8');
    res.json({ success: true, updated: Object.keys(updates) });
  } catch (e) {
    console.error('Settings PUT error:', e);
    res.status(500).json({ error: 'Erreur sauvegarde paramètres' });
  }
});

export default router;



