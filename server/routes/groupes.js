import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { Groupe } from '../models/Groupe.js';
import { verifyEmploye } from '../middleware/auth.js';

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
const groupeValidation = [
  body('seance_id')
    .isInt({ min: 1 })
    .withMessage('ID séance invalide'),
  body('nom')
    .notEmpty()
    .withMessage('Le nom est obligatoire'),
  body('capacite')
    .isInt({ min: 1 })
    .withMessage('La capacité doit être un nombre positif'),
  body('description')
    .optional()
    .isString()
    .withMessage('La description doit être une chaîne de caractères'),
  body('date_debut')
    .optional()
    .isISO8601()
    .withMessage('La date de début doit être au format ISO 8601'),
  body('date_fin')
    .optional()
    .isISO8601()
    .withMessage('La date de fin doit être au format ISO 8601'),
  body('enseignant_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID enseignant invalide')
];

// GET /api/groupes - Lister tous les groupes
router.get('/', [
  query('seance_id').optional().isInt({ min: 1 }),
  query('entreprise_id').optional().isInt({ min: 1 }),
  query('search').optional().isString()
], handleValidationErrors, (req, res) => {
  try {
    const filters = {};
    
    if (req.query.seance_id) filters.seance_id = req.query.seance_id;
    if (req.query.entreprise_id) filters.entreprise_id = req.query.entreprise_id;
    if (req.query.search) filters.search = req.query.search;
    
    const groupes = Groupe.getAll(filters);
    res.json(groupes);
  } catch (error) {
    console.error('Erreur lors de la récupération des groupes:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des groupes' });
  }
});

// GET /api/groupes/:id - Récupérer un groupe par ID
router.get('/:id', [
  param('id').isInt({ min: 1 }).withMessage('ID invalide')
], handleValidationErrors, (req, res) => {
  try {
    const groupe = Groupe.getById(req.params.id);
    
    if (!groupe) {
      return res.status(404).json({ error: 'Groupe non trouvé' });
    }
    
    res.json(groupe);
  } catch (error) {
    console.error('Erreur lors de la récupération du groupe:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du groupe' });
  }
});

// GET /api/groupes/seance/:seanceId - Groupes d'une séance
router.get('/seance/:seanceId', [
  param('seanceId').isInt({ min: 1 }).withMessage('ID séance invalide')
], handleValidationErrors, (req, res) => {
  try {
    const groupes = Groupe.getBySeance(req.params.seanceId);
    res.json(groupes);
  } catch (error) {
    console.error('Erreur lors de la récupération des groupes de la séance:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des groupes de la séance' });
  }
});

// GET /api/groupes/:id/participants - Participants d'un groupe
router.get('/:id/participants', [
  param('id').isInt({ min: 1 }).withMessage('ID invalide')
], handleValidationErrors, (req, res) => {
  try {
    const groupe = Groupe.getWithParticipants(req.params.id);
    
    if (!groupe) {
      return res.status(404).json({ error: 'Groupe non trouvé' });
    }
    
    res.json(groupe);
  } catch (error) {
    console.error('Erreur lors de la récupération des participants du groupe:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des participants du groupe' });
  }
});

// POST /api/groupes - Créer un nouveau groupe
// Only admin/employee endpoints should create groups. Forbid entreprise tokens.
router.post('/', verifyEmploye, groupeValidation, handleValidationErrors, (req, res) => {
  try {
    const groupe = Groupe.create(req.body);
    res.status(201).json(groupe);
  } catch (error) {
    console.error('Erreur lors de la création du groupe:', error);
    res.status(500).json({ error: 'Erreur lors de la création du groupe' });
  }
});

// PUT /api/groupes/:id - Mettre à jour un groupe
router.put('/:id', [
  param('id').isInt({ min: 1 }).withMessage('ID invalide'),
  ...groupeValidation
], verifyEmploye, handleValidationErrors, (req, res) => {
  try {
    const groupe = Groupe.update(req.params.id, req.body);
    
    if (!groupe) {
      return res.status(404).json({ error: 'Groupe non trouvé' });
    }
    
    res.json(groupe);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du groupe:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du groupe' });
  }
});

// DELETE /api/groupes/:id - Supprimer un groupe
router.delete('/:id', [
  param('id').isInt({ min: 1 }).withMessage('ID invalide')
], verifyEmploye, handleValidationErrors, (req, res) => {
  try {
    const success = Groupe.delete(req.params.id);
    
    if (!success) {
      return res.status(404).json({ error: 'Groupe non trouvé' });
    }
    
    res.json({ message: 'Groupe supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du groupe:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du groupe' });
  }
});

// GET /api/groupes/stats - Statistiques des groupes
router.get('/stats', (req, res) => {
  try {
    const stats = Groupe.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques des groupes:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques des groupes' });
  }
});

// GET /api/groupes/stats/:seanceId - Statistiques des groupes par séance
router.get('/stats/:seanceId', [
  param('seanceId').isInt({ min: 1 }).withMessage('ID séance invalide')
], handleValidationErrors, (req, res) => {
  try {
    const stats = Groupe.getStatsBySeance(req.params.seanceId);
    res.json(stats);
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques des groupes:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques des groupes' });
  }
});

export default router; 