import express from 'express';
import cors from 'cors';
import { body, validationResult } from 'express-validator';
import { Entreprise } from './server/models/Entreprise.js';
import { Employe } from './server/models/Employe.js';
import { initializeDatabase } from './server/database/database.js';

// Initialize database
initializeDatabase();

const app = express();
const PORT = 3008;

// Middleware
app.use(cors());
app.use(express.json());

// Validation error handler
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

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'Server is working!' });
});

// Login endpoint
app.post('/api/entreprise/login', [
  body('email').isEmail().withMessage('Email invalide'),
  body('password').notEmpty().withMessage('Mot de passe requis')
], handleValidationErrors, async (req, res) => {
  try {
    console.log('🔐 Login attempt');
    console.log('📝 Request body:', req.body);
    
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({
        error: 'Email et mot de passe requis'
      });
    }

    console.log('🔍 Authenticating...');
    const entreprise = await Entreprise.authenticate(email, password);
    console.log('📊 Auth result:', entreprise ? 'Success' : 'Failed');

    if (!entreprise) {
      console.log('❌ Authentication failed for:', email);
      return res.status(401).json({
        error: 'Email ou mot de passe incorrect'
      });
    }

    // Return entreprise data without password
    const { password: _, ...entrepriseData } = entreprise;
    console.log('✅ Login successful for:', email);

    res.json({
      success: true,
      entreprise: entrepriseData,
      message: 'Connexion réussie'
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
});

// Employee login endpoint
app.post('/api/employe/login', [
  body('email').isEmail().withMessage('Email invalide'),
  body('password').notEmpty().withMessage('Mot de passe requis')
], handleValidationErrors, async (req, res) => {
  try {
    console.log('🔐 Employee login attempt');
    console.log('📝 Request body:', req.body);

    const { email, password } = req.body;

    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({
        error: 'Email et mot de passe requis'
      });
    }

    console.log('🔍 Authenticating employee...');
    const employe = await Employe.authenticate(email, password);
    console.log('📊 Employee auth result:', employe ? 'Success' : 'Failed');

    if (!employe) {
      console.log('❌ Employee authentication failed for:', email);
      return res.status(401).json({
        error: 'Email ou mot de passe incorrect'
      });
    }

    // Return employe data without password
    const { password: _, ...employeData } = employe;
    console.log('✅ Employee login successful for:', email);

    res.json({
      success: true,
      employe: employeData,
      message: 'Connexion réussie'
    });
  } catch (error) {
    console.error('❌ Employee login error:', error);
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Test server running on http://localhost:${PORT}`);
  console.log(`📝 Test login at: http://localhost:${PORT}/api/entreprise/login`);
  console.log(`📝 Test endpoint: http://localhost:${PORT}/api/test`);
});
