import express from 'express';
import { query, validationResult } from 'express-validator';
import { Formation } from '../models/Formation.js';
import { Entreprise } from '../models/Entreprise.js';
import { Inscription } from '../models/Inscription.js';
import db from '../database/database.js';

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
      const inscriptionStats = Inscription.getStatsByEntreprise(entrepriseId);
      const inscriptionsRecentes = Inscription.getByEntreprise(entrepriseId).slice(0, 5);
      const formationsPopulaires = Formation.getPopularByEntreprise(entrepriseId);
      const monthlyStats = getMonthlyStatsByEntreprise(entrepriseId);

      const dashboardData = {
        stats: {
          totalFormations: formationsPopulaires.length,
          totalEntreprises: 1, // L'entreprise elle-même
          totalInscriptions: inscriptionStats.total,
          totalParticipants: inscriptionStats.totalParticipants,
          inscriptionsCeMois: inscriptionStats.thisMonth
        },
        inscriptionsRecentes,
        formationsPopulaires,
        monthlyStats
      };

      res.json(dashboardData);
    } else {
      // Dashboard global (mode admin)
      const totalFormations = Formation.getAll().length;
      const totalEntreprises = Entreprise.getAll().length;
      const inscriptionStats = Inscription.getStats();
      const inscriptionsRecentes = Inscription.getRecent(5);
      const formationsPopulaires = Formation.getPopular();
      const monthlyStats = getMonthlyStats();

      const dashboardData = {
        stats: {
          totalFormations,
          totalEntreprises,
          totalInscriptions: inscriptionStats.total,
          totalParticipants: inscriptionStats.totalParticipants,
          inscriptionsCeMois: inscriptionStats.thisMonth
        },
        inscriptionsRecentes,
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
        strftime('%Y-%m', created_at) as mois,
        COUNT(*) as inscriptions,
        SUM(nombre_participants) as participants
      FROM inscriptions
      WHERE created_at >= date('now', '-6 months')
      GROUP BY strftime('%Y-%m', created_at)
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
        strftime('%Y-%m', created_at) as mois,
        COUNT(*) as inscriptions,
        SUM(nombre_participants) as participants
      FROM inscriptions
      WHERE entreprise_id = ? AND created_at >= date('now', '-6 months')
      GROUP BY strftime('%Y-%m', created_at)
      ORDER BY mois ASC
    `);

    return stmt.all(entrepriseId);
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques mensuelles par entreprise:', error);
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
        COUNT(i.id) as total_inscriptions,
        SUM(i.nombre_participants) as total_participants
      FROM entreprises e
      LEFT JOIN inscriptions i ON e.id = i.entreprise_id
      GROUP BY e.id
      ORDER BY total_inscriptions DESC, e.raison_sociale ASC
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
