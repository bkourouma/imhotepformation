import express from 'express';
import { query, validationResult } from 'express-validator';
import { Formation } from '../models/Formation.js';
import { Entreprise } from '../models/Entreprise.js';
import { Employe } from '../models/Employe.js';
import { Seance } from '../models/Seance.js';
import { Groupe } from '../models/Groupe.js';
import { Participant } from '../models/Participant.js';
import { db } from '../database/database.js';

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

// GET /api/dashboard - Données du tableau de bord
router.get('/', [
  query('entreprise_id').optional().isInt({ min: 1 })
], handleValidationErrors, (req, res) => {
  try {
    const entrepriseId = req.query.entreprise_id;

    if (entrepriseId) {
      // Dashboard pour une entreprise spécifique
      const employeStats = Employe.getStatsByEntreprise(entrepriseId);
      const employesRecents = Employe.getByEntreprise(entrepriseId).slice(0, 5);
      const formationsPopulaires = Formation.getPopularByEntreprise(entrepriseId);
      const monthlyStats = getMonthlyStatsByEntreprise(entrepriseId);

      const dashboardData = {
        stats: {
          totalFormations: formationsPopulaires.length,
          totalEntreprises: 1, // L'entreprise elle-même
          totalEmployes: employeStats.total,
          totalParticipants: employeStats.totalParticipants,
          employesCeMois: employeStats.thisMonth
        },
        employesRecents,
        formationsPopulaires,
        monthlyStats
      };

      res.json(dashboardData);
    } else {
      // Dashboard global (mode admin)
      const totalFormations = Formation.getAll().length;
      const totalEntreprises = Entreprise.getAll().length;
      const employeStats = Employe.getStats();
      const employesRecents = getRecentEmployes(5);
      const formationsPopulaires = Formation.getPopular();
      const monthlyStats = getMonthlyStats();

      const dashboardData = {
        stats: {
          totalFormations,
          totalEntreprises,
          totalEmployes: employeStats.total,
          totalParticipants: employeStats.totalParticipants,
          employesCeMois: employeStats.thisMonth
        },
        employesRecents,
        formationsPopulaires,
        monthlyStats
      };

      res.json(dashboardData);
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des données du dashboard:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des données du dashboard' });
  }
});

// Fonction pour obtenir les statistiques mensuelles
function getMonthlyStats() {
  try {
    const stmt = db.prepare(`
      SELECT
        strftime('%Y-%m', e.created_at) as mois,
        COUNT(DISTINCT e.id) as employes,
        COUNT(p.id) as participants
      FROM employes e
      LEFT JOIN participants p ON e.id = p.employe_id
      WHERE e.created_at >= date('now', '-6 months')
      GROUP BY strftime('%Y-%m', e.created_at)
      ORDER BY mois ASC
    `);

    return stmt.all();
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques mensuelles:', error);
    return [];
  }
}

// Fonction pour obtenir les statistiques mensuelles par entreprise
function getMonthlyStatsByEntreprise(entrepriseId) {
  try {
    const stmt = db.prepare(`
      SELECT
        strftime('%Y-%m', e.created_at) as mois,
        COUNT(DISTINCT e.id) as employes,
        COUNT(p.id) as participants
      FROM employes e
      LEFT JOIN participants p ON e.id = p.employe_id
      WHERE e.entreprise_id = ? AND e.created_at >= date('now', '-6 months')
      GROUP BY strftime('%Y-%m', e.created_at)
      ORDER BY mois ASC
    `);

    return stmt.all(entrepriseId);
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques mensuelles par entreprise:', error);
    return [];
  }
}

// Fonction pour obtenir les employés récents
function getRecentEmployes(limit = 5) {
  try {
    const stmt = db.prepare(`
      SELECT 
        e.*,
        ent.raison_sociale as entreprise_nom
      FROM employes e
      LEFT JOIN entreprises ent ON e.entreprise_id = ent.id
      ORDER BY e.created_at DESC
      LIMIT ?
    `);

    return stmt.all(limit);
  } catch (error) {
    console.error('Erreur lors de la récupération des employés récents:', error);
    return [];
  }
}

// GET /api/dashboard/formations-stats - Statistiques détaillées des formations
router.get('/formations-stats', [
  query('entreprise_id').optional().isInt({ min: 1 })
], handleValidationErrors, (req, res) => {
  try {
    const entrepriseId = req.query.entreprise_id;

    let formations;
    if (entrepriseId) {
      formations = Formation.getPopularByEntreprise(entrepriseId);
    } else {
      formations = Formation.getPopular();
    }

    res.json(formations);
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques des formations:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques des formations' });
  }
});

// GET /api/dashboard/entreprises-stats - Statistiques des entreprises
router.get('/entreprises-stats', (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT 
        e.raison_sociale,
        e.email,
        COUNT(DISTINCT emp.id) as total_employes,
        COUNT(p.id) as total_participants
      FROM entreprises e
      LEFT JOIN employes emp ON e.id = emp.entreprise_id
      LEFT JOIN participants p ON emp.id = p.employe_id
      GROUP BY e.id
      ORDER BY total_employes DESC, e.raison_sociale ASC
      LIMIT 10
    `);
    
    const entreprisesStats = stmt.all();
    res.json(entreprisesStats);
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques des entreprises:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques des entreprises' });
  }
});

export default router;
