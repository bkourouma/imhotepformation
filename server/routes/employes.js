import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { Employe } from '../models/Employe.js';

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
const employeValidation = [
  body('entreprise_id')
    .isInt({ min: 1 })
    .withMessage('ID entreprise invalide'),
  body('nom')
    .notEmpty()
    .withMessage('Le nom est obligatoire'),
  body('prenom')
    .notEmpty()
    .withMessage('Le prénom est obligatoire'),
  body('email')
    .isEmail()
    .withMessage('Email invalide'),
  body('fonction')
    .notEmpty()
    .withMessage('La fonction est obligatoire'),
  body('telephone')
    .notEmpty()
    .withMessage('Le téléphone est obligatoire'),
  body('password')
    .optional()
    .isLength({ min: 4 })
    .withMessage('Le mot de passe doit contenir au moins 4 caractères')
];

// GET /api/employes - Lister tous les employés
router.get('/', [
  query('entreprise_id').optional().isInt({ min: 1 }),
  query('search').optional().isString()
], handleValidationErrors, (req, res) => {
  try {
    const filters = {};
    
    if (req.query.entreprise_id) filters.entreprise_id = req.query.entreprise_id;
    if (req.query.search) filters.search = req.query.search;
    
    const employes = Employe.getAll(filters);
    res.json(employes);
  } catch (error) {
    console.error('Erreur lors de la récupération des employés:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des employés' });
  }
});

// GET /api/employes/stats - Statistiques des employés
router.get('/stats', (req, res) => {
  try {
    const stats = Employe.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques des employés:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques des employés' });
  }
});

// GET /api/employes/:id - Récupérer un employé par ID
router.get('/:id', [
  param('id').isInt({ min: 1 }).withMessage('ID invalide')
], handleValidationErrors, (req, res) => {
  try {
    const employe = Employe.getById(req.params.id);
    
    if (!employe) {
      return res.status(404).json({ error: 'Employé non trouvé' });
    }
    
    res.json(employe);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'employé:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'employé' });
  }
});

// GET /api/employes/entreprise/:entrepriseId - Employés d'une entreprise
router.get('/entreprise/:entrepriseId', [
  param('entrepriseId').isInt({ min: 1 }).withMessage('ID entreprise invalide')
], handleValidationErrors, (req, res) => {
  try {
    const employes = Employe.getByEntreprise(req.params.entrepriseId);
    res.json(employes);
  } catch (error) {
    console.error('Erreur lors de la récupération des employés de l\'entreprise:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des employés de l\'entreprise' });
  }
});

// POST /api/employes - Créer un nouvel employé
router.post('/', employeValidation, handleValidationErrors, (req, res) => {
  try {
    const employe = Employe.create(req.body);
    res.status(201).json(employe);
  } catch (error) {
    console.error('Erreur lors de la création de l\'employé:', error);
    res.status(500).json({ error: 'Erreur lors de la création de l\'employé' });
  }
});

// PUT /api/employes/:id - Mettre à jour un employé
router.put('/:id', [
  param('id').isInt({ min: 1 }).withMessage('ID invalide'),
  ...employeValidation
], handleValidationErrors, (req, res) => {
  try {
    const employe = Employe.update(req.params.id, req.body);
    
    if (!employe) {
      return res.status(404).json({ error: 'Employé non trouvé' });
    }
    
    res.json(employe);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'employé:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'employé' });
  }
});

// DELETE /api/employes/:id - Supprimer un employé
router.delete('/:id', [
  param('id').isInt({ min: 1 }).withMessage('ID invalide')
], handleValidationErrors, (req, res) => {
  try {
    const success = Employe.delete(req.params.id);
    
    if (!success) {
      return res.status(404).json({ error: 'Employé non trouvé' });
    }
    
    res.json({ message: 'Employé supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'employé:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'employé' });
  }
});

// GET /api/employes/stats/:entrepriseId - Statistiques des employés par entreprise
router.get('/stats/:entrepriseId', [
  param('entrepriseId').isInt({ min: 1 }).withMessage('ID entreprise invalide')
], handleValidationErrors, (req, res) => {
  try {
    const stats = Employe.getStatsByEntreprise(req.params.entrepriseId);
    res.json(stats);
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques des employés:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques des employés' });
  }
});

export default router; 