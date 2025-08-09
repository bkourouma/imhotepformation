import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { Seance } from '../models/Seance.js';

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
const seanceValidation = [
  body('formation_id')
    .isInt({ min: 1 })
    .withMessage('ID formation invalide'),
  body('intitule')
    .notEmpty()
    .withMessage('L\'intitulé est obligatoire'),
  body('date_debut')
    .isISO8601()
    .withMessage('Date de début invalide'),
  body('date_fin')
    .isISO8601()
    .withMessage('Date de fin invalide'),
  body('lieu')
    .notEmpty()
    .withMessage('Le lieu est obligatoire'),
  body('capacite')
    .isInt({ min: 1 })
    .withMessage('La capacité doit être un nombre positif')
];

// GET /api/seances - Lister toutes les séances
router.get('/', [
  query('formation_id').optional().isInt({ min: 1 }),
  query('entreprise_id').optional().isInt({ min: 1 }),
  query('search').optional().isString()
], handleValidationErrors, (req, res) => {
  try {
    const filters = {};
    
    if (req.query.formation_id) filters.formation_id = req.query.formation_id;
    if (req.query.entreprise_id) filters.entreprise_id = req.query.entreprise_id;
    if (req.query.search) filters.search = req.query.search;
    
    const seances = Seance.getAll(filters);
    res.json(seances);
  } catch (error) {
    console.error('Erreur lors de la récupération des séances:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des séances' });
  }
});

// GET /api/seances/:id - Récupérer une séance par ID
router.get('/:id', [
  param('id').isInt({ min: 1 }).withMessage('ID invalide')
], handleValidationErrors, (req, res) => {
  try {
    const seance = Seance.getById(req.params.id);
    
    if (!seance) {
      return res.status(404).json({ error: 'Séance non trouvée' });
    }
    
    res.json(seance);
  } catch (error) {
    console.error('Erreur lors de la récupération de la séance:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de la séance' });
  }
});

// GET /api/seances/formation/:formationId - Séances d'une formation
router.get('/formation/:formationId', [
  param('formationId').isInt({ min: 1 }).withMessage('ID formation invalide')
], handleValidationErrors, (req, res) => {
  try {
    const seances = Seance.getByFormation(req.params.formationId);
    res.json(seances);
  } catch (error) {
    console.error('Erreur lors de la récupération des séances de la formation:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des séances de la formation' });
  }
});

// POST /api/seances - Créer une nouvelle séance
router.post('/', seanceValidation, handleValidationErrors, (req, res) => {
  try {
    const seance = Seance.create(req.body);
    res.status(201).json(seance);
  } catch (error) {
    console.error('Erreur lors de la création de la séance:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la séance' });
  }
});

// PUT /api/seances/:id - Mettre à jour une séance
router.put('/:id', [
  param('id').isInt({ min: 1 }).withMessage('ID invalide'),
  ...seanceValidation
], handleValidationErrors, (req, res) => {
  try {
    const seance = Seance.update(req.params.id, req.body);
    
    if (!seance) {
      return res.status(404).json({ error: 'Séance non trouvée' });
    }
    
    res.json(seance);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la séance:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la séance' });
  }
});

// DELETE /api/seances/:id - Supprimer une séance
router.delete('/:id', [
  param('id').isInt({ min: 1 }).withMessage('ID invalide')
], handleValidationErrors, (req, res) => {
  try {
    const success = Seance.delete(req.params.id);
    
    if (!success) {
      return res.status(404).json({ error: 'Séance non trouvée' });
    }
    
    res.json({ message: 'Séance supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la séance:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la séance' });
  }
});

// GET /api/seances/stats - Statistiques des séances
router.get('/stats', (req, res) => {
  try {
    const stats = Seance.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques des séances:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques des séances' });
  }
});

// GET /api/seances/stats/:formationId - Statistiques des séances par formation
router.get('/stats/:formationId', [
  param('formationId').isInt({ min: 1 }).withMessage('ID formation invalide')
], handleValidationErrors, (req, res) => {
  try {
    const stats = Seance.getStatsByFormation(req.params.formationId);
    res.json(stats);
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques des séances:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques des séances' });
  }
});

export default router; 