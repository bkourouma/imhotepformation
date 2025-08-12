import express from 'express';
import { body, validationResult } from 'express-validator';
import { generateAdminToken, verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Données invalides',
      details: errors.array()
    });
  }
  next();
};

// POST /api/admin/login - simple admin login (static creds in env or defaults)
router.post('/login', [
  body('username').notEmpty().withMessage('Nom d\'utilisateur requis'),
  body('password').notEmpty().withMessage('Mot de passe requis')
], handleValidationErrors, async (req, res) => {
  try {
    const { username, password } = req.body;

    const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Identifiants incorrects' });
    }

    const token = generateAdminToken(username);
    return res.json({ success: true, token, username });
  } catch (error) {
    return res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
});

// GET /api/admin/me - validate token
router.get('/me', verifyAdmin, (req, res) => {
  return res.json({ success: true, username: req.admin.username });
});

export default router;


