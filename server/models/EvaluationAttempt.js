import { db } from '../database/database.js';

export class EvaluationAttempt {
  static create(data) {
    const stmt = db.prepare(`
      INSERT INTO evaluation_attempts (evaluation_id, employe_id, score, total_points, pourcentage, reponses, temps_utilise, termine, date_fin)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      data.evaluation_id,
      data.employe_id,
      data.score,
      data.total_points,
      data.pourcentage,
      JSON.stringify(data.reponses || {}),
      data.temps_utilise,
      data.termine ? 1 : 0,
      data.date_fin
    );
    
    return result.lastInsertRowid;
  }

  static getById(id) {
    const stmt = db.prepare(`
      SELECT * FROM evaluation_attempts WHERE id = ?
    `);
    
    const attempt = stmt.get(id);
    if (attempt) {
      attempt.reponses = JSON.parse(attempt.reponses || '{}');
    }
    
    return attempt;
  }

  static getByEvaluation(evaluationId, employeId) {
    const stmt = db.prepare(`
      SELECT * FROM evaluation_attempts 
      WHERE evaluation_id = ? AND employe_id = ?
      ORDER BY created_at DESC
    `);
    
    const attempts = stmt.all(evaluationId, employeId);
    
    return attempts.map(attempt => ({
      ...attempt,
      reponses: JSON.parse(attempt.reponses || '{}')
    }));
  }

  static getByEmploye(employeId, limit = 50) {
    const stmt = db.prepare(`
      SELECT ea.*, e.titre as evaluation_titre, s.description as seance_description, f.intitule as formation_nom
      FROM evaluation_attempts ea
      JOIN evaluations e ON ea.evaluation_id = e.id
      JOIN seances s ON e.seance_id = s.id
      JOIN formations f ON s.formation_id = f.id
      WHERE ea.employe_id = ?
      ORDER BY ea.created_at DESC
      LIMIT ?
    `);
    
    const attempts = stmt.all(employeId, limit);
    
    return attempts.map(attempt => ({
      ...attempt,
      reponses: JSON.parse(attempt.reponses || '{}')
    }));
  }

  static update(id, data) {
    const stmt = db.prepare(`
      UPDATE evaluation_attempts 
      SET score = ?, total_points = ?, pourcentage = ?, reponses = ?, temps_utilise = ?, termine = ?, date_fin = ?
      WHERE id = ?
    `);
    
    return stmt.run(
      data.score,
      data.total_points,
      data.pourcentage,
      JSON.stringify(data.reponses || {}),
      data.temps_utilise,
      data.termine ? 1 : 0,
      data.date_fin,
      id
    );
  }
}
