import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { Enseignant } from '../models/Enseignant.js';

const router = express.Router();

// Middleware pour gérer les erreurs de validation
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
const enseignantValidation = [
  body('nom')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Le nom est requis et doit faire entre 1 et 100 caractères'),
  body('prenom')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Le prénom est requis et doit faire entre 1 et 100 caractères'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email invalide'),
  body('telephone')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Le téléphone doit faire maximum 20 caractères'),
  body('specialites')
    .optional()
    .isArray()
    .withMessage('Les spécialités doivent être un tableau'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('La bio doit faire maximum 1000 caractères'),
  body('actif')
    .optional()
    .isBoolean()
    .withMessage('Le statut actif doit être un booléen')
];

// GET /api/enseignants - Lister tous les enseignants
router.get('/', [
  query('actif').optional().isBoolean(),
  query('search').optional().isString()
], handleValidationErrors, (req, res) => {
  try {
    const filters = {};
    
    if (req.query.actif !== undefined) filters.actif = req.query.actif === 'true' ? 1 : 0;
    if (req.query.search) filters.search = req.query.search;
    
    const enseignants = Enseignant.getAll(filters);
    res.json(enseignants);
  } catch (error) {
    console.error('Erreur lors de la récupération des enseignants:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des enseignants' });
  }
});

// GET /api/enseignants/active - Lister les enseignants actifs
router.get('/active', (req, res) => {
  try {
    const enseignants = Enseignant.getActive();
    res.json(enseignants);
  } catch (error) {
    console.error('Erreur lors de la récupération des enseignants actifs:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des enseignants actifs' });
  }
});

// GET /api/enseignants/stats - Statistiques des enseignants
router.get('/stats', (req, res) => {
  try {
    const stats = Enseignant.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
});

// GET /api/enseignants/:id - Récupérer un enseignant par ID
router.get('/:id', [
  param('id').isInt({ min: 1 }).withMessage('ID invalide')
], handleValidationErrors, (req, res) => {
  try {
    const enseignant = Enseignant.getById(req.params.id);
    if (!enseignant) {
      return res.status(404).json({ error: 'Enseignant non trouvé' });
    }
    res.json(enseignant);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'enseignant:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'enseignant' });
  }
});

// GET /api/enseignants/:id/groupes - Récupérer un enseignant avec ses groupes
router.get('/:id/groupes', [
  param('id').isInt({ min: 1 }).withMessage('ID invalide')
], handleValidationErrors, (req, res) => {
  try {
    const enseignant = Enseignant.getWithGroups(req.params.id);
    if (!enseignant) {
      return res.status(404).json({ error: 'Enseignant non trouvé' });
    }
    res.json(enseignant);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'enseignant avec groupes:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'enseignant avec groupes' });
  }
});

// POST /api/enseignants - Créer un nouvel enseignant
router.post('/', enseignantValidation, handleValidationErrors, (req, res) => {
  try {
    // Vérifier si l'email existe déjà
    const existingEnseignant = Enseignant.getByEmail(req.body.email);
    if (existingEnseignant) {
      return res.status(400).json({ error: 'Un enseignant avec cet email existe déjà' });
    }

    const enseignant = Enseignant.create(req.body);
    res.status(201).json(enseignant);
  } catch (error) {
    console.error('Erreur lors de la création de l\'enseignant:', error);
    res.status(500).json({ error: 'Erreur lors de la création de l\'enseignant' });
  }
});

// PUT /api/enseignants/:id - Mettre à jour un enseignant
router.put('/:id', [
  param('id').isInt({ min: 1 }).withMessage('ID invalide'),
  ...enseignantValidation
], handleValidationErrors, (req, res) => {
  try {
    // Vérifier si l'enseignant existe
    const existingEnseignant = Enseignant.getById(req.params.id);
    if (!existingEnseignant) {
      return res.status(404).json({ error: 'Enseignant non trouvé' });
    }

    // Vérifier si l'email existe déjà pour un autre enseignant
    const enseignantWithEmail = Enseignant.getByEmail(req.body.email);
    if (enseignantWithEmail && enseignantWithEmail.id !== parseInt(req.params.id)) {
      return res.status(400).json({ error: 'Un autre enseignant avec cet email existe déjà' });
    }

    const enseignant = Enseignant.update(req.params.id, req.body);
    if (!enseignant) {
      return res.status(404).json({ error: 'Enseignant non trouvé' });
    }
    res.json(enseignant);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'enseignant:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'enseignant' });
  }
});

// DELETE /api/enseignants/:id - Supprimer un enseignant
router.delete('/:id', [
  param('id').isInt({ min: 1 }).withMessage('ID invalide')
], handleValidationErrors, (req, res) => {
  try {
    const success = Enseignant.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Enseignant non trouvé' });
    }
    res.json({ message: 'Enseignant supprimé avec succès' });
  } catch (error) {
    if (error.message.includes('assigné à des groupes')) {
      return res.status(400).json({ error: error.message });
    }
    console.error('Erreur lors de la suppression de l\'enseignant:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'enseignant' });
  }
});

export default router;
