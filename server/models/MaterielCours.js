import { db } from '../database/database.js';

export class MaterielCours {
  static getAll(filters = {}) {
    let query = `
      SELECT mc.*, s.description as seance_description, f.intitule as formation_intitule
      FROM materiel_cours mc
      JOIN seances s ON mc.seance_id = s.id
      JOIN formations f ON s.formation_id = f.id
      WHERE 1=1
    `;
    
    const params = [];

    if (filters.seance_id) {
      query += ' AND mc.seance_id = ?';
      params.push(filters.seance_id);
    }

    if (filters.formation_id) {
      query += ' AND s.formation_id = ?';
      params.push(filters.formation_id);
    }

    if (filters.type) {
      query += ' AND mc.type = ?';
      params.push(filters.type);
    }

    query += ' ORDER BY mc.libelle';

    const stmt = db.prepare(query);
    return stmt.all(...params);
  }

  static getById(id) {
    const stmt = db.prepare(`
      SELECT mc.*, s.description as seance_description, f.intitule as formation_intitule
      FROM materiel_cours mc
      JOIN seances s ON mc.seance_id = s.id
      JOIN formations f ON s.formation_id = f.id
      WHERE mc.id = ?
    `);
    return stmt.get(id);
  }

  static getBySeance(seanceId) {
    const stmt = db.prepare(`
      SELECT mc.*
      FROM materiel_cours mc
      WHERE mc.seance_id = ?
      ORDER BY mc.libelle
    `);
    return stmt.all(seanceId);
  }

  static create(data) {
    const stmt = db.prepare(`
      INSERT INTO materiel_cours (seance_id, libelle, description, type, url)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      data.seance_id,
      data.libelle,
      data.description || null,
      data.type || 'document',
      data.url || null
    );

    return this.getById(result.lastInsertRowid);
  }

  static update(id, data) {
    const stmt = db.prepare(`
      UPDATE materiel_cours
      SET seance_id = ?, libelle = ?, description = ?, type = ?, url = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    const result = stmt.run(
      data.seance_id,
      data.libelle,
      data.description || null,
      data.type || 'document',
      data.url || null,
      id
    );

    if (result.changes > 0) {
      return this.getById(id);
    }
    
    return null;
  }

  static delete(id) {
    const stmt = db.prepare('DELETE FROM materiel_cours WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  static getStats() {
    const totalStmt = db.prepare('SELECT COUNT(*) as total FROM materiel_cours');
    const total = totalStmt.get().total;

    const byTypeStmt = db.prepare(`
      SELECT type, COUNT(*) as count
      FROM materiel_cours
      GROUP BY type
      ORDER BY count DESC
    `);

    const bySeanceStmt = db.prepare(`
      SELECT s.description as seance_description, COUNT(mc.id) as count
      FROM seances s
      LEFT JOIN materiel_cours mc ON s.id = mc.seance_id
      GROUP BY s.id
      ORDER BY count DESC
    `);

    return {
      total,
      byType: byTypeStmt.all(),
      bySeance: bySeanceStmt.all()
    };
  }

  static getStatsBySeance(seanceId) {
    const totalStmt = db.prepare('SELECT COUNT(*) as total FROM materiel_cours WHERE seance_id = ?');
    const total = totalStmt.get(seanceId).total;

    const byTypeStmt = db.prepare(`
      SELECT type, COUNT(*) as count
      FROM materiel_cours
      WHERE seance_id = ?
      GROUP BY type
      ORDER BY count DESC
    `);

    return {
      total,
      byType: byTypeStmt.all(seanceId)
    };
  }
} 