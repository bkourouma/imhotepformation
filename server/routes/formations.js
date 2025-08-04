import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { Formation } from '../models/Formation.js';

const router = express.Router();

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error('Erreurs de validation:', errors.array());
    console.error('Données reçues:', req.body);
    return res.status(400).json({
      error: 'Données invalides',
      details: errors.array()
    });
  }
  next();
};

// Validation rules
const formationValidation = [
  body('intitule')
    .trim()
    .isLength({ min: 3 })
    .withMessage('L\'intitulé doit contenir au moins 3 caractères'),
  body('cible')
    .trim()
    .isLength({ min: 10 })
    .withMessage('La cible doit contenir au moins 10 caractères'),
  body('objectifs_pedagogiques')
    .trim()
    .isLength({ min: 20 })
    .withMessage('Les objectifs pédagogiques doivent contenir au moins 20 caractères'),
  body('contenu')
    .trim()
    .isLength({ min: 50 })
    .withMessage('Le contenu doit contenir au moins 50 caractères')
];

// GET /api/formations - Lister toutes les formations
router.get('/', [
  query('search').optional().trim().isLength({ max: 100 })
], handleValidationErrors, (req, res) => {
  try {
    const { search } = req.query;
    let formations;
    
    if (search) {
      formations = Formation.search(search);
    } else {
      formations = Formation.getAll();
    }
    
    res.json(formations);
  } catch (error) {
    console.error('Erreur lors de la récupération des formations:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des formations' });
  }
});

// GET /api/formations/popular - Formations populaires
router.get('/popular', (req, res) => {
  try {
    const formations = Formation.getPopular();
    res.json(formations);
  } catch (error) {
    console.error('Erreur lors de la récupération des formations populaires:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des formations populaires' });
  }
});

// GET /api/formations/:id - Récupérer une formation par ID
router.get('/:id', [
  param('id').isInt({ min: 1 }).withMessage('ID invalide')
], handleValidationErrors, (req, res) => {
  try {
    const formation = Formation.getById(req.params.id);
    
    if (!formation) {
      return res.status(404).json({ error: 'Formation non trouvée' });
    }
    
    res.json(formation);
  } catch (error) {
    console.error('Erreur lors de la récupération de la formation:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de la formation' });
  }
});

// POST /api/formations - Créer une nouvelle formation
router.post('/', formationValidation, handleValidationErrors, (req, res) => {
  try {
    const formation = Formation.create(req.body);
    res.status(201).json(formation);
  } catch (error) {
    console.error('Erreur lors de la création de la formation:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la formation' });
  }
});

// PUT /api/formations/:id - Mettre à jour une formation
router.put('/:id', [
  param('id').isInt({ min: 1 }).withMessage('ID invalide'),
  ...formationValidation
], handleValidationErrors, (req, res) => {
  try {
    const formation = Formation.update(req.params.id, req.body);
    
    if (!formation) {
      return res.status(404).json({ error: 'Formation non trouvée' });
    }
    
    res.json(formation);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la formation:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la formation' });
  }
});

// DELETE /api/formations/:id - Supprimer une formation
router.delete('/:id', [
  param('id').isInt({ min: 1 }).withMessage('ID invalide')
], handleValidationErrors, (req, res) => {
  try {
    const success = Formation.delete(req.params.id);
    
    if (!success) {
      return res.status(404).json({ error: 'Formation non trouvée' });
    }
    
    res.json({ message: 'Formation supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la formation:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la formation' });
  }
});

export default router;
