import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { Participant } from '../models/Participant.js';
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
const participantValidation = [
  body('employe_id')
    .isInt({ min: 1 })
    .withMessage('ID employé invalide'),
  body('groupe_id')
    .isInt({ min: 1 })
    .withMessage('ID groupe invalide'),
  body('present')
    .optional()
    .isBoolean()
    .withMessage('Présence doit être un booléen')
];

// Validation for multiple participants
const participantsValidation = [
  body('participants')
    .isArray({ min: 1 })
    .withMessage('Au moins un participant est requis'),
  body('participants.*.employe_id')
    .isInt({ min: 1 })
    .withMessage('ID employé invalide'),
  body('participants.*.groupe_id')
    .isInt({ min: 1 })
    .withMessage('ID groupe invalide'),
  body('participants.*.present')
    .optional()
    .isBoolean()
    .withMessage('Présence doit être un booléen')
];

// GET /api/participants - Lister tous les participants
router.get('/', [
  query('groupe_id').optional().isInt({ min: 1 }),
  query('employe_id').optional().isInt({ min: 1 }),
  query('present').optional().isBoolean()
], handleValidationErrors, (req, res) => {
  try {
    const filters = {};
    
    if (req.query.groupe_id) filters.groupe_id = req.query.groupe_id;
    if (req.query.employe_id) filters.employe_id = req.query.employe_id;
    if (req.query.present !== undefined) filters.present = req.query.present;
    
    const participants = Participant.getAll(filters);
    res.json(participants);
  } catch (error) {
    console.error('Erreur lors de la récupération des participants:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des participants' });
  }
});

// GET /api/participants/:id - Récupérer un participant par ID
router.get('/:id', [
  param('id').isInt({ min: 1 }).withMessage('ID invalide')
], handleValidationErrors, (req, res) => {
  try {
    const participant = Participant.getById(req.params.id);
    
    if (!participant) {
      return res.status(404).json({ error: 'Participant non trouvé' });
    }
    
    res.json(participant);
  } catch (error) {
    console.error('Erreur lors de la récupération du participant:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du participant' });
  }
});

// GET /api/participants/employe/:employeId - Participants d'un employé
router.get('/employe/:employeId', [
  param('employeId').isInt({ min: 1 }).withMessage('ID employé invalide')
], handleValidationErrors, (req, res) => {
  try {
    const participants = Participant.getByEmploye(req.params.employeId);
    res.json(participants);
  } catch (error) {
    console.error('Erreur lors de la récupération des participants de l\'employé:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des participants de l\'employé' });
  }
});

// GET /api/participants/groupe/:groupeId - Participants d'un groupe
router.get('/groupe/:groupeId', [
  param('groupeId').isInt({ min: 1 }).withMessage('ID groupe invalide')
], handleValidationErrors, (req, res) => {
  try {
    const participants = Participant.getByGroupe(req.params.groupeId);
    res.json(participants);
  } catch (error) {
    console.error('Erreur lors de la récupération des participants du groupe:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des participants du groupe' });
  }
});

// POST /api/participants - Créer un nouveau participant
// Forbid entreprise tokens from creating participants; require employee/admin context
router.post('/', verifyEmploye, participantValidation, handleValidationErrors, (req, res) => {
  try {
    const participant = Participant.create(req.body);
    res.status(201).json(participant);
  } catch (error) {
    console.error('Erreur lors de la création du participant:', error);
    res.status(500).json({ error: 'Erreur lors de la création du participant' });
  }
});

// POST /api/participants/bulk - Créer plusieurs participants
router.post('/bulk', verifyEmploye, participantsValidation, handleValidationErrors, (req, res) => {
  try {
    const participants = req.body.participants;
    const createdParticipants = [];
    
    for (const participantData of participants) {
      try {
        const participant = Participant.create(participantData);
        createdParticipants.push(participant);
      } catch (error) {
        // Skip if participant already exists (UNIQUE constraint)
        console.log('Participant déjà existant:', participantData);
      }
    }
    
    res.status(201).json({
      message: `${createdParticipants.length} participant(s) créé(s)`,
      participants: createdParticipants
    });
  } catch (error) {
    console.error('Erreur lors de la création des participants:', error);
    res.status(500).json({ error: 'Erreur lors de la création des participants' });
  }
});

// PUT /api/participants/:id - Mettre à jour un participant
router.put('/:id', [
  param('id').isInt({ min: 1 }).withMessage('ID invalide'),
  ...participantValidation
], verifyEmploye, handleValidationErrors, (req, res) => {
  try {
    const participant = Participant.update(req.params.id, req.body);
    
    if (!participant) {
      return res.status(404).json({ error: 'Participant non trouvé' });
    }
    
    res.json(participant);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du participant:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du participant' });
  }
});

// PUT /api/participants/:id/present - Marquer comme présent
router.put('/:id/present', [
  param('id').isInt({ min: 1 }).withMessage('ID invalide')
], verifyEmploye, handleValidationErrors, (req, res) => {
  try {
    const participant = Participant.markPresent(req.params.id);
    
    if (!participant) {
      return res.status(404).json({ error: 'Participant non trouvé' });
    }
    
    res.json(participant);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la présence:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la présence' });
  }
});

// PUT /api/participants/:id/absent - Marquer comme absent
router.put('/:id/absent', [
  param('id').isInt({ min: 1 }).withMessage('ID invalide')
], verifyEmploye, handleValidationErrors, (req, res) => {
  try {
    const participant = Participant.markAbsent(req.params.id);
    
    if (!participant) {
      return res.status(404).json({ error: 'Participant non trouvé' });
    }
    
    res.json(participant);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la présence:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la présence' });
  }
});

// DELETE /api/participants/:id - Supprimer un participant
router.delete('/:id', [
  param('id').isInt({ min: 1 }).withMessage('ID invalide')
], verifyEmploye, handleValidationErrors, (req, res) => {
  try {
    const success = Participant.delete(req.params.id);
    
    if (!success) {
      return res.status(404).json({ error: 'Participant non trouvé' });
    }
    
    res.json({ message: 'Participant supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du participant:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du participant' });
  }
});

// GET /api/participants/stats - Statistiques des participants
router.get('/stats', (req, res) => {
  try {
    const stats = Participant.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques des participants:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques des participants' });
  }
});

// GET /api/participants/stats/:entrepriseId - Statistiques des participants par entreprise
router.get('/stats/:entrepriseId', [
  param('entrepriseId').isInt({ min: 1 }).withMessage('ID entreprise invalide')
], handleValidationErrors, (req, res) => {
  try {
    const stats = Participant.getStatsByEntreprise(req.params.entrepriseId);
    res.json(stats);
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques des participants:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques des participants' });
  }
});

// GET /api/participants/stats/formation/:formationId - Statistiques des participants par formation
router.get('/stats/formation/:formationId', [
  param('formationId').isInt({ min: 1 }).withMessage('ID formation invalide')
], handleValidationErrors, (req, res) => {
  try {
    const stats = Participant.getStatsByFormation(req.params.formationId);
    res.json(stats);
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques des participants:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques des participants' });
  }
});

// Presence management routes

// GET /api/participants/groupe/:groupeId - Get participants for a specific group
router.get('/groupe/:groupeId', [
  param('groupeId').isInt({ min: 1 }).withMessage('ID groupe invalide')
], handleValidationErrors, (req, res) => {
  try {
    const participants = Participant.getByGroupe(req.params.groupeId);
    res.json(participants);
  } catch (error) {
    console.error('Erreur lors de la récupération des participants du groupe:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des participants du groupe' });
  }
});

// GET /api/participants/formation/:formationId/presence - Get presence for a formation
router.get('/formation/:formationId/presence', [
  param('formationId').isInt({ min: 1 }).withMessage('ID formation invalide')
], handleValidationErrors, (req, res) => {
  try {
    const participants = Participant.getPresenceByFormation(req.params.formationId);
    res.json(participants);
  } catch (error) {
    console.error('Erreur lors de la récupération des présences de la formation:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des présences de la formation' });
  }
});

// GET /api/participants/seance/:seanceId/presence - Get presence for a seance
router.get('/seance/:seanceId/presence', [
  param('seanceId').isInt({ min: 1 }).withMessage('ID séance invalide')
], handleValidationErrors, (req, res) => {
  try {
    const participants = Participant.getPresenceBySeance(req.params.seanceId);
    res.json(participants);
  } catch (error) {
    console.error('Erreur lors de la récupération des présences de la séance:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des présences de la séance' });
  }
});

// GET /api/participants/groupe/:groupeId/stats - Get presence stats for a group
router.get('/groupe/:groupeId/stats', [
  param('groupeId').isInt({ min: 1 }).withMessage('ID groupe invalide')
], handleValidationErrors, (req, res) => {
  try {
    const stats = Participant.getPresenceStats(req.params.groupeId);
    res.json(stats);
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques de présence:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques de présence' });
  }
});

// PUT /api/participants/:id/presence - Update presence for a single participant
router.put('/:id/presence', [
  param('id').isInt({ min: 1 }).withMessage('ID participant invalide'),
  body('present').isBoolean().withMessage('Le statut de présence doit être un booléen')
], verifyEmploye, handleValidationErrors, (req, res) => {
  try {
    const success = Participant.updatePresence(req.params.id, req.body.present);

    if (!success) {
      return res.status(404).json({ error: 'Participant non trouvé' });
    }

    res.json({ message: 'Présence mise à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la présence:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la présence' });
  }
});

// PUT /api/participants/presence/bulk - Update presence for multiple participants
router.put('/presence/bulk', [
  body('updates').isArray().withMessage('Les mises à jour doivent être un tableau'),
  body('updates.*.participantId').isInt({ min: 1 }).withMessage('ID participant invalide'),
  body('updates.*.present').isBoolean().withMessage('Le statut de présence doit être un booléen')
], verifyEmploye, handleValidationErrors, (req, res) => {
  try {
    const success = Participant.updateMultiplePresence(req.body.updates);

    if (!success) {
      return res.status(500).json({ error: 'Erreur lors de la mise à jour des présences' });
    }

    res.json({
      message: 'Présences mises à jour avec succès',
      updated: req.body.updates.length
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des présences:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour des présences' });
  }
});

export default router;