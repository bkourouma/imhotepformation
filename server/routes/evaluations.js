import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { Evaluation } from '../models/Evaluation.js';
import { EvaluationQuestion } from '../models/EvaluationQuestion.js';
import { EvaluationAttempt } from '../models/EvaluationAttempt.js';
import { SeanceMedia } from '../models/SeanceMedia.js';
import { generateEvaluationQuestions, validateSeanceForQuestionGeneration } from '../services/aiQuestionService.js';
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

// GET /api/evaluations/seance/:seanceId - Get evaluations for a seance
router.get('/seance/:seanceId', (req, res) => {
  try {
    const { seanceId } = req.params;
    const { employeId } = req.query;
    
    const evaluations = Evaluation.getBySeance(seanceId);
    
    // If employeId is provided, get attempts for each evaluation
    if (employeId) {
      const evaluationsWithAttempts = evaluations.map(evaluation => {
        const attempts = EvaluationAttempt.getByEvaluation(evaluation.id, employeId);
        return {
          ...evaluation,
          attempts
        };
      });
      
      return res.json(evaluationsWithAttempts);
    }
    
    res.json(evaluations);
  } catch (error) {
    console.error('Erreur lors de la récupération des évaluations:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des évaluations' });
  }
});

// GET /api/evaluations/employe/:employeId - Get evaluations for an employee
router.get('/employe/:employeId', (req, res) => {
  try {
    const { employeId } = req.params;
    
    const evaluations = Evaluation.getByEmploye(employeId);
    
    res.json(evaluations);
  } catch (error) {
    console.error('Erreur lors de la récupération des évaluations:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des évaluations' });
  }
});

// GET /api/evaluations/analytics/enterprise/:entrepriseId - Get evaluation analytics for enterprise
router.get('/analytics/enterprise/:entrepriseId', [
  param('entrepriseId').isInt({ min: 1 }).withMessage('ID entreprise invalide')
], handleValidationErrors, (req, res) => {
  try {
    const { entrepriseId } = req.params;

    // Enterprise info
    const entStmt = db.prepare(`
      SELECT id, raison_sociale, email
      FROM entreprises
      WHERE id = ?
    `);
    const ent = entStmt.get(entrepriseId);
    if (!ent) {
      return res.status(404).json({ error: 'Entreprise non trouvée' });
    }

    // Number of employees
    const empCount = db.prepare('SELECT COUNT(*) as c FROM employes WHERE entreprise_id = ?').get(entrepriseId).c;

    // Attempts for employees in this enterprise
    const attemptsStmt = db.prepare(`
      SELECT 
        ea.id, ea.evaluation_id, ea.employe_id, ea.score, ea.total_points, ea.pourcentage,
        ea.reponses, ea.temps_utilise, ea.termine, ea.date_debut, ea.date_fin, ea.created_at,
        emp.nom as employe_nom, emp.prenom as employe_prenom, emp.email as employe_email,
        ev.titre as evaluation_titre,
        f.intitule as formation_nom
      FROM evaluation_attempts ea
      JOIN employes emp ON ea.employe_id = emp.id
      JOIN evaluations ev ON ea.evaluation_id = ev.id
      JOIN seances s ON ev.seance_id = s.id
      JOIN formations f ON s.formation_id = f.id
      WHERE emp.entreprise_id = ?
      ORDER BY ea.created_at DESC
    `);
    const attemptsRaw = attemptsStmt.all(entrepriseId);

    const attempts = attemptsRaw.map(a => {
      let parsed = {};
      try { parsed = a.reponses ? JSON.parse(a.reponses) : {}; } catch (_) { parsed = {}; }
      return { ...a, reponses: parsed };
    });

    const statistics = calculateEvaluationStats(attempts);

    return res.json({
      entreprise: {
        id: ent.id,
        nom: ent.raison_sociale,
        email: ent.email,
        employees: empCount
      },
      attempts,
      statistics
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des analytics:', error);
    return res.status(500).json({ error: 'Erreur lors de la récupération des analytics' });
  }
});

// GET /api/evaluations/:evaluationId - Get evaluation details with questions
router.get('/:evaluationId', (req, res) => {
  try {
    const { evaluationId } = req.params;
    
    const evaluation = Evaluation.getById(evaluationId);
    if (!evaluation) {
      return res.status(404).json({ error: 'Évaluation non trouvée' });
    }
    
    const questions = EvaluationQuestion.getByEvaluation(evaluationId);
    
    res.json({
      ...evaluation,
      questions
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'évaluation:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'évaluation' });
  }
});

// GET /api/evaluations/validate-seance/:seanceId - Validate if seance can generate questions
router.get('/validate-seance/:seanceId', [
  param('seanceId').isInt({ min: 1 }).withMessage('ID séance invalide')
], handleValidationErrors, async (req, res) => {
  try {
    const { seanceId } = req.params;

    const validation = await validateSeanceForQuestionGeneration(seanceId);

    res.json(validation);
  } catch (error) {
    console.error('Erreur lors de la validation de la séance:', error);
    res.status(500).json({ error: 'Erreur lors de la validation de la séance' });
  }
});

// POST /api/evaluations/create - Create a new evaluation with AI-generated questions
router.post('/create', [
  body('seance_id').isInt({ min: 1 }).withMessage('ID séance invalide'),
  body('employe_id').isInt({ min: 1 }).withMessage('ID employé invalide'),
  body('titre').notEmpty().withMessage('Titre requis'),
  body('description').optional(),
  body('nombre_questions').optional().isInt({ min: 1, max: 50 }).withMessage('Nombre de questions invalide'),
  body('duree_minutes').optional().isInt({ min: 5, max: 120 }).withMessage('Durée invalide')
], handleValidationErrors, async (req, res) => {
  try {
    const { seance_id, employe_id, titre, description, nombre_questions = 20, duree_minutes = 30 } = req.body;
    
    // Create evaluation
    const evaluationId = Evaluation.create({
      seance_id,
      employe_id,
      titre,
      description,
      nombre_questions,
      duree_minutes
    });
    
    // Generate AI questions based on seance media content using ChatGPT-4o
    console.log(`🤖 Génération de questions IA pour la séance ${seance_id}...`);
    const questionGeneration = await generateEvaluationQuestions(seance_id, nombre_questions);

    if (!questionGeneration.success) {
      return res.status(400).json({
        error: questionGeneration.error,
        details: 'Impossible de générer des questions à partir du contenu des documents'
      });
    }

    const questions = questionGeneration.questions;
    
    // Save questions
    questions.forEach((question, index) => {
      EvaluationQuestion.create({
        evaluation_id: evaluationId,
        question: question.question,
        type: question.type,
        options: question.options,
        correct_answers: question.correct_answers,
        points: question.points,
        ordre: index + 1
      });
    });
    
    res.json({
      success: true,
      evaluation_id: evaluationId,
      message: 'Évaluation créée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'évaluation:', error);
    res.status(500).json({ error: 'Erreur lors de la création de l\'évaluation' });
  }
});

// POST /api/evaluations/:evaluationId/start - Start an evaluation attempt
router.post('/:evaluationId/start', [
  body('employe_id').isInt({ min: 1 }).withMessage('ID employé invalide')
], handleValidationErrors, (req, res) => {
  try {
    const { evaluationId } = req.params;
    const { employe_id } = req.body;
    
    const evaluation = Evaluation.getById(evaluationId);
    if (!evaluation) {
      return res.status(404).json({ error: 'Évaluation non trouvée' });
    }
    
    // Create attempt
    const attemptId = EvaluationAttempt.create({
      evaluation_id: evaluationId,
      employe_id,
      score: 0,
      total_points: 0,
      pourcentage: 0,
      reponses: {},
      temps_utilise: 0,
      termine: false
    });
    
    res.json({
      success: true,
      attempt_id: attemptId,
      message: 'Tentative démarrée'
    });
  } catch (error) {
    console.error('Erreur lors du démarrage de l\'évaluation:', error);
    res.status(500).json({ error: 'Erreur lors du démarrage de l\'évaluation' });
  }
});

// POST /api/evaluations/:evaluationId/submit - Submit evaluation answers
router.post('/:evaluationId/submit', [
  body('employe_id').isInt({ min: 1 }).withMessage('ID employé invalide'),
  body('reponses').isObject().withMessage('Réponses requises'),
  body('temps_utilise').isInt({ min: 0 }).withMessage('Temps utilisé invalide')
], handleValidationErrors, (req, res) => {
  try {
    const { evaluationId } = req.params;
    const { employe_id, reponses, temps_utilise } = req.body;
    
    const evaluation = Evaluation.getById(evaluationId);
    if (!evaluation) {
      return res.status(404).json({ error: 'Évaluation non trouvée' });
    }
    
    const questions = EvaluationQuestion.getByEvaluation(evaluationId);
    
    // Calculate score
    let score = 0;
    let totalPoints = 0;
    
    questions.forEach(question => {
      totalPoints += question.points;
      const userAnswer = reponses[question.id];
      
      if (question.type === 'multiple_choice') {
        if (userAnswer && userAnswer === question.correct_answers[0]) {
          score += question.points;
        }
      } else if (question.type === 'multiple_choice_multiple') {
        if (userAnswer && Array.isArray(userAnswer)) {
          const correctCount = question.correct_answers.length;
          const userCorrectCount = userAnswer.filter(ans => 
            question.correct_answers.includes(ans)
          ).length;
          
          if (userCorrectCount === correctCount && userAnswer.length === correctCount) {
            score += question.points;
          }
        }
      } else if (question.type === 'text') {
        // For text questions, we'll need more sophisticated evaluation
        // For now, we'll give partial credit if the answer contains keywords
        if (userAnswer && userAnswer.trim().length > 0) {
          score += question.points * 0.5; // 50% credit for any text answer
        }
      }
    });
    
    const pourcentage = totalPoints > 0 ? (score / totalPoints) * 100 : 0;
    
    // Create or update attempt
    const attempts = EvaluationAttempt.getByEvaluation(evaluationId, employe_id);
    let attemptId;
    
    if (attempts.length > 0) {
      // Update existing attempt
      const attempt = attempts[0];
      EvaluationAttempt.update(attempt.id, {
        score,
        total_points: totalPoints,
        pourcentage,
        reponses,
        temps_utilise,
        termine: true,
        date_fin: new Date().toISOString()
      });
      attemptId = attempt.id;
    } else {
      // Create new attempt
      attemptId = EvaluationAttempt.create({
        evaluation_id: evaluationId,
        employe_id,
        score,
        total_points: totalPoints,
        pourcentage,
        reponses,
        temps_utilise,
        termine: true,
        date_fin: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      attempt_id: attemptId,
      score,
      total_points: totalPoints,
      pourcentage: Math.round(pourcentage * 100) / 100,
      message: 'Évaluation terminée'
    });
  } catch (error) {
    console.error('Erreur lors de la soumission de l\'évaluation:', error);
    res.status(500).json({ error: 'Erreur lors de la soumission de l\'évaluation' });
  }
});

// GET /api/evaluations/attempts/:employeId - Get evaluation attempts for an employee
router.get('/attempts/:employeId', (req, res) => {
  try {
    const { employeId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit) : 50;

    const attempts = EvaluationAttempt.getByEmploye(employeId, limit);

    res.json(attempts);
  } catch (error) {
    console.error('Erreur lors de la récupération des tentatives:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des tentatives' });
  }
});



// GET /api/evaluations/analytics/admin - Get evaluation analytics for admin (all enterprises)
router.get('/analytics/admin', (req, res) => {
  try {
    const { entreprise_id, formation_id, limit = 100 } = req.query;

    let query = `
      SELECT
        ea.*,
        e.titre as evaluation_titre,
        s.description as seance_description,
        f.intitule as formation_nom,
        emp.nom as employe_nom,
        emp.prenom as employe_prenom,
        emp.email as employe_email,
         ent.raison_sociale as entreprise_nom
      FROM evaluation_attempts ea
      JOIN evaluations e ON ea.evaluation_id = e.id
      JOIN seances s ON e.seance_id = s.id
      JOIN formations f ON s.formation_id = f.id
      JOIN employes emp ON ea.employe_id = emp.id
      JOIN entreprises ent ON emp.entreprise_id = ent.id
      WHERE 1=1
    `;

    const params = [];

    if (entreprise_id) {
      query += ' AND emp.entreprise_id = ?';
      params.push(entreprise_id);
    }

    if (formation_id) {
      query += ' AND s.formation_id = ?';
      params.push(formation_id);
    }

    query += ' ORDER BY ea.created_at DESC LIMIT ?';
    params.push(parseInt(limit));

    const stmt = db.prepare(query);
    const attempts = stmt.all(...params);

    // Calculate global statistics
    const stats = calculateEvaluationStats(attempts);

    // Get enterprise breakdown
    const enterpriseStats = calculateEnterpriseStats(attempts);

    res.json({
      attempts: attempts.map(attempt => ({
        ...attempt,
        reponses: JSON.parse(attempt.reponses || '{}')
      })),
      statistics: stats,
      enterpriseBreakdown: enterpriseStats
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des analytics admin:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des analytics admin' });
  }
});

// GET /api/evaluations/attempts/:employeId/:attemptId/details - Get detailed evaluation attempt with questions and answers
router.get('/attempts/:employeId/:attemptId/details', [
  param('employeId').isInt({ min: 1 }).withMessage('ID employé invalide'),
  param('attemptId').isInt({ min: 1 }).withMessage('ID tentative invalide')
], handleValidationErrors, (req, res) => {
  try {
    const { employeId, attemptId } = req.params;

    // Get the attempt
    const attempt = EvaluationAttempt.getById(attemptId);
    if (!attempt) {
      return res.status(404).json({ error: 'Tentative non trouvée' });
    }

    // Verify the attempt belongs to the employee
    if (attempt.employe_id !== parseInt(employeId)) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    // Get the evaluation details
    const evaluation = Evaluation.getById(attempt.evaluation_id);
    if (!evaluation) {
      return res.status(404).json({ error: 'Évaluation non trouvée' });
    }

    // Get all questions for this evaluation
    const questions = EvaluationQuestion.getByEvaluation(attempt.evaluation_id);

    // Combine questions with user answers
    const questionsWithAnswers = questions.map(question => {
      const userAnswer = attempt.reponses[question.id] || null;

      return {
        ...question,
        user_answer: userAnswer,
        is_correct: isAnswerCorrect(question, userAnswer)
      };
    });

    res.json({
      attempt: {
        ...attempt,
        evaluation_titre: evaluation.titre,
        evaluation_description: evaluation.description
      },
      questions: questionsWithAnswers,
      summary: {
        total_questions: questions.length,
        correct_answers: questionsWithAnswers.filter(q => q.is_correct).length,
        score: attempt.score,
        total_points: attempt.total_points,
        pourcentage: attempt.pourcentage,
        temps_utilise: attempt.temps_utilise
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des détails de la tentative:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des détails de la tentative' });
  }
});

// Helper function to check if an answer is correct
function isAnswerCorrect(question, userAnswer) {
  if (!userAnswer) return false;

  switch (question.type) {
    case 'multiple_choice':
      return userAnswer === question.correct_answers[0];

    case 'multiple_choice_multiple':
      if (!Array.isArray(userAnswer)) return false;
      const correctSet = new Set(question.correct_answers);
      const userSet = new Set(userAnswer);

      // Check if sets are equal
      return correctSet.size === userSet.size &&
             [...correctSet].every(answer => userSet.has(answer));

    case 'text':
      // For text questions, we'll consider them correct if there's an answer
      // In a real implementation, you might want more sophisticated checking
      return userAnswer && userAnswer.trim().length > 0;

    default:
      return false;
  }
}



// Helper function to calculate evaluation statistics
function calculateEvaluationStats(attempts) {
  if (attempts.length === 0) {
    return {
      totalAttempts: 0,
      averageScore: 0,
      passRate: 0,
      completionRate: 0,
      averageTime: 0,
      scoreDistribution: { excellent: 0, good: 0, average: 0, poor: 0 }
    };
  }

  const completedAttempts = attempts.filter(a => a.termine);
  const totalScore = completedAttempts.reduce((sum, a) => sum + a.pourcentage, 0);
  const averageScore = completedAttempts.length > 0 ? totalScore / completedAttempts.length : 0;
  const passRate = completedAttempts.length > 0 ?
    (completedAttempts.filter(a => a.pourcentage >= 70).length / completedAttempts.length) * 100 : 0;
  const completionRate = (completedAttempts.length / attempts.length) * 100;

  const totalTime = completedAttempts.reduce((sum, a) => sum + (a.temps_utilise || 0), 0);
  const averageTime = completedAttempts.length > 0 ? totalTime / completedAttempts.length : 0;

  // Score distribution
  const scoreDistribution = {
    excellent: completedAttempts.filter(a => a.pourcentage >= 90).length,
    good: completedAttempts.filter(a => a.pourcentage >= 70 && a.pourcentage < 90).length,
    average: completedAttempts.filter(a => a.pourcentage >= 50 && a.pourcentage < 70).length,
    poor: completedAttempts.filter(a => a.pourcentage < 50).length
  };

  return {
    totalAttempts: attempts.length,
    completedAttempts: completedAttempts.length,
    averageScore: Math.round(averageScore * 100) / 100,
    passRate: Math.round(passRate * 100) / 100,
    completionRate: Math.round(completionRate * 100) / 100,
    averageTime: Math.round(averageTime),
    scoreDistribution
  };
}

// Helper function to calculate enterprise-specific statistics
function calculateEnterpriseStats(attempts) {
  const enterpriseGroups = attempts.reduce((groups, attempt) => {
    const enterpriseName = attempt.entreprise_nom || 'Unknown';
    if (!groups[enterpriseName]) {
      groups[enterpriseName] = [];
    }
    groups[enterpriseName].push(attempt);
    return groups;
  }, {});

  return Object.entries(enterpriseGroups).map(([enterpriseName, enterpriseAttempts]) => ({
    entrepriseName: enterpriseName,
    ...calculateEvaluationStats(enterpriseAttempts)
  }));
}

export default router;
