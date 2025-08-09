import { db } from '../database/database.js';

export class Evaluation {
  static create(data) {
    const stmt = db.prepare(`
      INSERT INTO evaluations (seance_id, employe_id, titre, description, nombre_questions, duree_minutes)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      data.seance_id,
      data.employe_id,
      data.titre,
      data.description,
      data.nombre_questions || 20,
      data.duree_minutes || 30
    );
    
    return result.lastInsertRowid;
  }

  static getById(id) {
    const stmt = db.prepare(`
      SELECT * FROM evaluations WHERE id = ?
    `);
    
    return stmt.get(id);
  }

  static getBySeance(seanceId) {
    const stmt = db.prepare(`
      SELECT * FROM evaluations WHERE seance_id = ?
    `);
    
    return stmt.all(seanceId);
  }

  static getByEmploye(employeId) {
    const stmt = db.prepare(`
      SELECT e.*, s.description as seance_description, f.intitule as formation_nom
      FROM evaluations e
      JOIN seances s ON e.seance_id = s.id
      JOIN formations f ON s.formation_id = f.id
      WHERE e.employe_id = ?
      ORDER BY e.created_at DESC
    `);
    
    return stmt.all(employeId);
  }

  static delete(id) {
    const stmt = db.prepare(`
      DELETE FROM evaluations WHERE id = ?
    `);
    
    return stmt.run(id);
  }
}
