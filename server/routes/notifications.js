import express from 'express';
import { body, validationResult } from 'express-validator';
import nodemailer from 'nodemailer';
import twilio from 'twilio';
import { db } from '../database/database.js';

const router = express.Router();

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Données invalides', details: errors.array() });
  }
  next();
};

function getMailTransport() {
  // Supports SMTP configuration via env
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = process.env;
  if (!SMTP_HOST) {
    // Fallback: Ethereal (dev only)
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: { user: process.env.ETHEREAL_USER || 'user', pass: process.env.ETHEREAL_PASS || 'pass' },
    });
  }
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: (SMTP_SECURE || 'false') === 'true',
    auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
  });
}

function getTwilioClient() {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = process.env;
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) return null;
  return twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
}

// Utility: Resolve recipients
function queryRecipients({ scope, targetIds = [], role }) {
  // scope: 'entreprise' | 'employe'
  if (scope === 'entreprise') {
    if (targetIds.length === 0) {
      return db.prepare('SELECT id, raison_sociale as nom, email, telephone FROM entreprises').all();
    }
    const placeholders = targetIds.map(() => '?').join(',');
    return db.prepare(`SELECT id, raison_sociale as nom, email, telephone FROM entreprises WHERE id IN (${placeholders})`).all(...targetIds);
  }
  // employe scope
  if (targetIds.length === 0) {
    return db.prepare('SELECT id, prenom || " " || nom as nom, email, telephone FROM employes').all();
  }
  const placeholders = targetIds.map(() => '?').join(',');
  return db.prepare(`SELECT id, prenom || " " || nom as nom, email, telephone FROM employes WHERE id IN (${placeholders})`).all(...targetIds);
}

// POST /api/notifications/email
router.post('/email', [
  body('scope').isIn(['entreprise', 'employe']).withMessage('Scope invalide'),
  body('targetIds').optional().isArray().withMessage('targetIds doit être un tableau d\'IDs'),
  body('subject').notEmpty().withMessage('Sujet requis'),
  body('message').notEmpty().withMessage('Message requis'),
], handleValidationErrors, async (req, res) => {
  try {
    const { scope, targetIds = [], subject, message } = req.body;
    const recipients = queryRecipients({ scope, targetIds });

    if (recipients.length === 0) return res.json({ success: true, sent: 0 });

    const transport = getMailTransport();
    const results = [];
    for (const r of recipients) {
      if (!r.email) continue;
      try {
        const info = await transport.sendMail({
          from: process.env.SMTP_FROM || 'no-reply@engage-360.net',
          to: r.email,
          subject,
          html: `<p>Bonjour ${r.nom || ''},</p><p>${message}</p>`
        });
        results.push({ id: r.id, email: r.email, messageId: info.messageId });
      } catch (e) {
        results.push({ id: r.id, email: r.email, error: e.message });
      }
    }
    res.json({ success: true, sent: results.filter(r => !r.error).length, results });
  } catch (error) {
    console.error('Erreur envoi email:', error);
    res.status(500).json({ error: 'Erreur lors de l\'envoi des emails' });
  }
});

// POST /api/notifications/whatsapp
router.post('/whatsapp', [
  body('scope').isIn(['entreprise', 'employe']).withMessage('Scope invalide'),
  body('targetIds').optional().isArray().withMessage('targetIds doit être un tableau d\'IDs'),
  body('message').notEmpty().withMessage('Message requis'),
], handleValidationErrors, async (req, res) => {
  try {
    const client = getTwilioClient();
    if (!client) return res.status(400).json({ error: 'Twilio non configuré' });

    const { TWILIO_WHATSAPP_FROM } = process.env;
    if (!TWILIO_WHATSAPP_FROM) return res.status(400).json({ error: 'Numéro WhatsApp Twilio manquant' });

    const { scope, targetIds = [], message } = req.body;
    const recipients = queryRecipients({ scope, targetIds });

    const results = [];
    for (const r of recipients) {
      if (!r.telephone) continue;
      try {
        const resp = await client.messages.create({
          from: `whatsapp:${TWILIO_WHATSAPP_FROM}`,
          to: `whatsapp:${r.telephone}`,
          body: message,
        });
        results.push({ id: r.id, to: r.telephone, sid: resp.sid });
      } catch (e) {
        results.push({ id: r.id, to: r.telephone, error: e.message });
      }
    }
    res.json({ success: true, sent: results.filter(r => !r.error).length, results });
  } catch (error) {
    console.error('Erreur envoi WhatsApp:', error);
    res.status(500).json({ error: 'Erreur lors de l\'envoi WhatsApp' });
  }
});

export default router;


