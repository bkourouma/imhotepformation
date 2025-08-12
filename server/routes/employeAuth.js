import express from 'express';
import { body, validationResult } from 'express-validator';
import { Employe } from '../models/Employe.js';
import { generateEmployeToken } from '../middleware/auth.js';
import { Seance } from '../models/Seance.js';
import { SeanceMedia } from '../models/SeanceMedia.js';
import { MediaAccessHistory } from '../models/MediaAccessHistory.js';

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

// GET /api/employe/test - Test route to check database
router.get('/test', (req, res) => {
  try {
    console.log('🧪 Test route - Vérification de la base de données');
    
    // Test getting all employees
    const allEmployes = Employe.getAll();
    console.log('📊 Nombre total d\'employés:', allEmployes.length);
    
    // Test getting a specific employee
    const testEmploye = Employe.getByEmail('moussa.traore@bmi.ci');
    console.log('👤 Test employé trouvé:', testEmploye ? 'Oui' : 'Non');
    
    res.json({
      success: true,
      totalEmployes: allEmployes.length,
      testEmployeFound: !!testEmploye,
      message: 'Test de la base de données réussi'
    });
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    res.status(500).json({ error: 'Erreur lors du test' });
  }
});

// POST /api/employe/login - Connexion employé
router.post('/login', [
  body('email').isEmail().withMessage('Email invalide'),
  body('password').notEmpty().withMessage('Mot de passe requis')
], handleValidationErrors, async (req, res) => {
  try {
    console.log('🔐 Tentative de connexion employé');
    console.log('📝 Request body:', req.body);
    console.log('📝 Request headers:', req.headers);
    
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('❌ Email ou mot de passe manquant');
      return res.status(400).json({
        error: 'Email et mot de passe requis'
      });
    }

    console.log('🔍 Recherche de l\'employé dans la base de données...');
    const employe = await Employe.authenticate(email, password);
    console.log('📊 Résultat de l\'authentification:', employe ? 'Trouvé' : 'Non trouvé');

    if (!employe) {
      console.log('❌ Authentification échouée pour:', email);
      return res.status(401).json({
        error: 'Email ou mot de passe incorrect'
      });
    }

    // Return employee data without password and issue JWT
    const { password: _, ...employeData } = employe;
    console.log('✅ Connexion réussie pour:', email);

    const token = generateEmployeToken(employe);

    res.json({
      success: true,
      employe: employeData,
      token,
      message: 'Connexion réussie'
    });
  } catch (error) {
    console.error('❌ Erreur lors de la connexion employé:', error);
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
});

// GET /api/employe/formations - Formations de l'employé
router.get('/formations/:employeId', (req, res) => {
  try {
    const { employeId } = req.params;
    
    const formations = Employe.getFormationsByEmploye(employeId);
    
    res.json(formations);
  } catch (error) {
    console.error('Erreur lors de la récupération des formations:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des formations' });
  }
});

// GET /api/employe/seances - Séances de l'employé
router.get('/seances/:employeId', (req, res) => {
  try {
    const { employeId } = req.params;
    
    const seances = Employe.getSeancesByEmploye(employeId);
    
    res.json(seances);
  } catch (error) {
    console.error('Erreur lors de la récupération des séances:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des séances' });
  }
});

// GET /api/employe/seances/:seanceId/media - Media d'une séance
router.get('/seances/:seanceId/media', (req, res) => {
  try {
    const { seanceId } = req.params;
    
    const media = SeanceMedia.getBySeance(seanceId);
    
    res.json(media);
  } catch (error) {
    console.error('Erreur lors de la récupération des media:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des media' });
  }
});

// POST /api/employe/media/:mediaId/access - Enregistrer l'accès à un media
router.post('/media/:mediaId/access', [
  body('employe_id').isInt({ min: 1 }).withMessage('ID employé invalide')
], handleValidationErrors, (req, res) => {
  try {
    const { mediaId } = req.params;
    const { employe_id } = req.body;
    
    // Get client IP and user agent
    const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
    const userAgent = req.headers['user-agent'];
    
    // Record access
    MediaAccessHistory.create({
      employe_id,
      seance_media_id: mediaId,
      ip_address: ipAddress,
      user_agent: userAgent
    });
    
    res.json({ 
      success: true, 
      message: 'Accès enregistré' 
    });
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de l\'accès:', error);
    res.status(500).json({ error: 'Erreur lors de l\'enregistrement de l\'accès' });
  }
});

// GET /api/employe/history/:employeId - Historique des accès de l'employé
router.get('/history/:employeId', (req, res) => {
  try {
    const { employeId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit) : 50;
    
    const history = MediaAccessHistory.getByEmploye(employeId, limit);
    
    res.json(history);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'historique' });
  }
});

export default router;
