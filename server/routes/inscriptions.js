import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { Inscription } from '../models/Inscription.js';
import { Entreprise } from '../models/Entreprise.js';
import { Formation } from '../models/Formation.js';

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

// Validation rules
const inscriptionValidation = [
  body('entreprise_id')
    .isInt({ min: 1 })
    .withMessage('ID entreprise invalide'),
  body('formation_id')
    .isInt({ min: 1 })
    .withMessage('ID formation invalide'),
  body('nombre_participants')
    .isInt({ min: 1, max: 100 })
    .withMessage('Le nombre de participants doit être entre 1 et 100'),
  body('date_souhaitee')
    .isISO8601()
    .toDate()
    .custom((value) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (value < today) {
        throw new Error('La date souhaitée ne peut pas être dans le passé');
      }
      return true;
    })
    .withMessage('Date souhaitée invalide')
];

// GET /api/inscriptions - Lister toutes les inscriptions
router.get('/', [
  query('entreprise_id').optional().isInt({ min: 1 }),
  query('formation_id').optional().isInt({ min: 1 }),
  query('date_debut').optional().isISO8601(),
  query('date_fin').optional().isISO8601()
], handleValidationErrors, (req, res) => {
  try {
    const filters = {};
    
    if (req.query.entreprise_id) filters.entreprise_id = req.query.entreprise_id;
    if (req.query.formation_id) filters.formation_id = req.query.formation_id;
    if (req.query.date_debut) filters.date_debut = req.query.date_debut;
    if (req.query.date_fin) filters.date_fin = req.query.date_fin;
    
    let inscriptions;
    
    if (Object.keys(filters).length > 0) {
      inscriptions = Inscription.filter(filters);
    } else {
      inscriptions = Inscription.getAll();
    }
    
    res.json(inscriptions);
  } catch (error) {
    console.error('Erreur lors de la récupération des inscriptions:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des inscriptions' });
  }
});

// GET /api/inscriptions/recent - Inscriptions récentes
router.get('/recent', [
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('entreprise_id').optional().isInt({ min: 1 })
], handleValidationErrors, (req, res) => {
  try {
    const limit = req.query.limit || 5;
    const entrepriseId = req.query.entreprise_id;

    let inscriptions;
    if (entrepriseId) {
      // Filtrer par entreprise
      inscriptions = Inscription.getByEntreprise(entrepriseId).slice(0, limit);
    } else {
      // Toutes les inscriptions récentes (mode admin)
      inscriptions = Inscription.getRecent(limit);
    }

    res.json(inscriptions);
  } catch (error) {
    console.error('Erreur lors de la récupération des inscriptions récentes:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des inscriptions récentes' });
  }
});

// GET /api/inscriptions/stats - Statistiques des inscriptions
router.get('/stats', [
  query('entreprise_id').optional().isInt({ min: 1 })
], handleValidationErrors, (req, res) => {
  try {
    const entrepriseId = req.query.entreprise_id;

    if (entrepriseId) {
      // Statistiques pour une entreprise spécifique
      const stats = Inscription.getStatsByEntreprise(entrepriseId);
      res.json(stats);
    } else {
      // Statistiques globales (mode admin)
      const stats = Inscription.getStats();
      res.json(stats);
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
});

// GET /api/inscriptions/:id - Récupérer une inscription par ID
router.get('/:id', [
  param('id').isInt({ min: 1 }).withMessage('ID invalide')
], handleValidationErrors, (req, res) => {
  try {
    const inscription = Inscription.getById(req.params.id);
    
    if (!inscription) {
      return res.status(404).json({ error: 'Inscription non trouvée' });
    }
    
    res.json(inscription);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'inscription:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'inscription' });
  }
});

// POST /api/inscriptions - Créer une nouvelle inscription
router.post('/', inscriptionValidation, handleValidationErrors, async (req, res) => {
  try {
    // Vérifier que l'entreprise existe
    const entreprise = Entreprise.getById(req.body.entreprise_id);
    if (!entreprise) {
      return res.status(404).json({ error: 'Entreprise non trouvée' });
    }

    // Vérifier que la formation existe
    const formation = Formation.getById(req.body.formation_id);
    if (!formation) {
      return res.status(404).json({ error: 'Formation non trouvée' });
    }

    const inscription = Inscription.create(req.body);
    res.status(201).json(inscription);
  } catch (error) {
    console.error('Erreur lors de la création de l\'inscription:', error);
    res.status(500).json({ error: 'Erreur lors de la création de l\'inscription' });
  }
});

// PUT /api/inscriptions/:id - Mettre à jour une inscription
router.put('/:id', [
  param('id').isInt({ min: 1 }).withMessage('ID invalide'),
  ...inscriptionValidation
], handleValidationErrors, async (req, res) => {
  try {
    // Vérifier que l'entreprise existe
    const entreprise = Entreprise.getById(req.body.entreprise_id);
    if (!entreprise) {
      return res.status(404).json({ error: 'Entreprise non trouvée' });
    }

    // Vérifier que la formation existe
    const formation = Formation.getById(req.body.formation_id);
    if (!formation) {
      return res.status(404).json({ error: 'Formation non trouvée' });
    }

    const inscription = Inscription.update(req.params.id, req.body);
    
    if (!inscription) {
      return res.status(404).json({ error: 'Inscription non trouvée' });
    }
    
    res.json(inscription);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'inscription:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'inscription' });
  }
});

// DELETE /api/inscriptions/:id - Supprimer une inscription
router.delete('/:id', [
  param('id').isInt({ min: 1 }).withMessage('ID invalide')
], handleValidationErrors, (req, res) => {
  try {
    const success = Inscription.delete(req.params.id);
    
    if (!success) {
      return res.status(404).json({ error: 'Inscription non trouvée' });
    }
    
    res.json({ message: 'Inscription supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'inscription:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'inscription' });
  }
});

export default router;
