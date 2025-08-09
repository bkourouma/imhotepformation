import { db } from '../database/database.js';

export class EvaluationQuestion {
  static create(data) {
    const stmt = db.prepare(`
      INSERT INTO evaluation_questions (evaluation_id, question, type, options, correct_answers, points, ordre)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      data.evaluation_id,
      data.question,
      data.type,
      JSON.stringify(data.options || []),
      JSON.stringify(data.correct_answers || []),
      data.points || 1,
      data.ordre
    );
    
    return result.lastInsertRowid;
  }

  static getByEvaluation(evaluationId) {
    const stmt = db.prepare(`
      SELECT * FROM evaluation_questions 
      WHERE evaluation_id = ? 
      ORDER BY ordre
    `);
    
    const questions = stmt.all(evaluationId);
    
    // Parse JSON fields
    return questions.map(q => ({
      ...q,
      options: JSON.parse(q.options || '[]'),
      correct_answers: JSON.parse(q.correct_answers || '[]')
    }));
  }

  static deleteByEvaluation(evaluationId) {
    const stmt = db.prepare(`
      DELETE FROM evaluation_questions WHERE evaluation_id = ?
    `);
    
    return stmt.run(evaluationId);
  }
}
