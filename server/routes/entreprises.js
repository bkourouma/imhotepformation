import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { Entreprise } from '../models/Entreprise.js';

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
const entrepriseValidation = [
  body('raison_sociale')
    .trim()
    .isLength({ min: 2 })
    .withMessage('La raison sociale doit contenir au moins 2 caractères'),
  body('telephone')
    .trim()
    .matches(/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/)
    .withMessage('Le numéro de téléphone n\'est pas valide'),
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('L\'adresse email n\'est pas valide')
];

// GET /api/entreprises - Lister toutes les entreprises
router.get('/', [
  query('search').optional().trim().isLength({ max: 100 })
], handleValidationErrors, (req, res) => {
  try {
    const { search } = req.query;
    let entreprises;
    
    if (search) {
      entreprises = Entreprise.search(search);
    } else {
      entreprises = Entreprise.getAll();
    }
    
    res.json(entreprises);
  } catch (error) {
    console.error('Erreur lors de la récupération des entreprises:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des entreprises' });
  }
});

// GET /api/entreprises/:id - Récupérer une entreprise par ID
router.get('/:id', [
  param('id').isInt({ min: 1 }).withMessage('ID invalide')
], handleValidationErrors, (req, res) => {
  try {
    const entreprise = Entreprise.getById(req.params.id);
    
    if (!entreprise) {
      return res.status(404).json({ error: 'Entreprise non trouvée' });
    }
    
    res.json(entreprise);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'entreprise:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'entreprise' });
  }
});

// GET /api/entreprises/:id/profile - Profil complet avec inscriptions
router.get('/:id/profile', [
  param('id').isInt({ min: 1 }).withMessage('ID invalide')
], handleValidationErrors, (req, res) => {
  try {
    const entreprise = Entreprise.getWithInscriptions(req.params.id);
    
    if (!entreprise) {
      return res.status(404).json({ error: 'Entreprise non trouvée' });
    }
    
    res.json(entreprise);
  } catch (error) {
    console.error('Erreur lors de la récupération du profil de l\'entreprise:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du profil de l\'entreprise' });
  }
});

// POST /api/entreprises - Créer une nouvelle entreprise
router.post('/', entrepriseValidation, handleValidationErrors, (req, res) => {
  try {
    // Vérifier si l'email existe déjà
    const existingEntreprise = Entreprise.getByEmail(req.body.email);
    if (existingEntreprise) {
      return res.status(409).json({ 
        error: 'Une entreprise avec cette adresse email existe déjà' 
      });
    }

    const entreprise = Entreprise.create(req.body);
    res.status(201).json(entreprise);
  } catch (error) {
    console.error('Erreur lors de la création de l\'entreprise:', error);
    
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ 
        error: 'Une entreprise avec cette raison sociale existe déjà' 
      });
    }
    
    res.status(500).json({ error: 'Erreur lors de la création de l\'entreprise' });
  }
});

// PUT /api/entreprises/:id - Mettre à jour une entreprise
router.put('/:id', [
  param('id').isInt({ min: 1 }).withMessage('ID invalide'),
  ...entrepriseValidation
], handleValidationErrors, (req, res) => {
  try {
    // Vérifier si l'email existe déjà pour une autre entreprise
    const existingEntreprise = Entreprise.getByEmail(req.body.email);
    if (existingEntreprise && existingEntreprise.id != req.params.id) {
      return res.status(409).json({ 
        error: 'Une autre entreprise avec cette adresse email existe déjà' 
      });
    }

    const entreprise = Entreprise.update(req.params.id, req.body);
    
    if (!entreprise) {
      return res.status(404).json({ error: 'Entreprise non trouvée' });
    }
    
    res.json(entreprise);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'entreprise:', error);
    
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ 
        error: 'Une entreprise avec cette raison sociale existe déjà' 
      });
    }
    
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'entreprise' });
  }
});

// DELETE /api/entreprises/:id - Supprimer une entreprise
router.delete('/:id', [
  param('id').isInt({ min: 1 }).withMessage('ID invalide')
], handleValidationErrors, (req, res) => {
  try {
    const success = Entreprise.delete(req.params.id);
    
    if (!success) {
      return res.status(404).json({ error: 'Entreprise non trouvée' });
    }
    
    res.json({ message: 'Entreprise supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'entreprise:', error);
    
    if (error.message.includes('des inscriptions associées')) {
      return res.status(409).json({ 
        error: 'Impossible de supprimer cette entreprise car elle a des inscriptions associées' 
      });
    }
    
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'entreprise' });
  }
});

export default router;
