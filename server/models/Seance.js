import { db } from '../database/database.js';

export class Seance {
  static getAll(filters = {}) {
    let query = `
      SELECT s.*, f.intitule as formation_nom, f.cible as formation_cible
      FROM seances s
      JOIN formations f ON s.formation_id = f.id
      WHERE 1=1
    `;
    
    const params = [];

    if (filters.formation_id) {
      query += ' AND s.formation_id = ?';
      params.push(filters.formation_id);
    }

    if (filters.search) {
      query += ' AND (s.description LIKE ? OR f.intitule LIKE ? OR s.lieu LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY s.date_debut ASC';

    const stmt = db.prepare(query);
    return stmt.all(...params);
  }

  static getById(id) {
    const stmt = db.prepare(`
      SELECT s.*, f.intitule as formation_nom, f.cible as formation_cible, f.objectifs_pedagogiques as formation_objectifs
      FROM seances s
      JOIN formations f ON s.formation_id = f.id
      WHERE s.id = ?
    `);
    return stmt.get(id);
  }

  static getByFormation(formationId) {
    const stmt = db.prepare(`
      SELECT s.*
      FROM seances s
      WHERE s.formation_id = ?
      ORDER BY s.date_debut ASC
    `);
    return stmt.all(formationId);
  }

  static create(data) {
    const stmt = db.prepare(`
      INSERT INTO seances (formation_id, description, duree, lieu, date_debut, date_fin, capacite_max)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      data.formation_id,
      data.intitule, // Map intitule from frontend to description in database
      data.duree || 8, // Default to 8 hours if not provided
      data.lieu,
      data.date_debut,
      data.date_fin,
      data.capacite || 20
    );

    return this.getById(result.lastInsertRowid);
  }

  static update(id, data) {
    const stmt = db.prepare(`
      UPDATE seances
      SET formation_id = ?, description = ?, duree = ?, lieu = ?, date_debut = ?, date_fin = ?, capacite_max = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    const result = stmt.run(
      data.formation_id,
      data.intitule, // Map intitule from frontend to description in database
      data.duree || 8, // Default to 8 hours if not provided
      data.lieu,
      data.date_debut,
      data.date_fin,
      data.capacite || 20,
      id
    );

    if (result.changes > 0) {
      return this.getById(id);
    }
    
    return null;
  }

  static delete(id) {
    const stmt = db.prepare('DELETE FROM seances WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  static getUpcoming(limit = 10) {
    const stmt = db.prepare(`
      SELECT s.*, f.intitule as formation_nom
      FROM seances s
      JOIN formations f ON s.formation_id = f.id
      WHERE s.date_debut >= datetime('now')
      ORDER BY s.date_debut ASC
      LIMIT ?
    `);
    return stmt.all(limit);
  }

  static getStats() {
    const totalStmt = db.prepare('SELECT COUNT(*) as total FROM seances');
    const total = totalStmt.get().total;
    
    const upcomingStmt = db.prepare(`
      SELECT COUNT(*) as total 
      FROM seances 
      WHERE date_debut >= datetime('now')
    `);
    const upcoming = upcomingStmt.get().total;
    
    const byFormationStmt = db.prepare(`
      SELECT f.intitule, COUNT(s.id) as count
      FROM formations f
      LEFT JOIN seances s ON f.id = s.formation_id
      GROUP BY f.id
      ORDER BY count DESC
    `);
    
    return {
      total,
      upcoming,
      byFormation: byFormationStmt.all()
    };
  }

  static getStatsByFormation(formationId) {
    const totalStmt = db.prepare('SELECT COUNT(*) as total FROM seances WHERE formation_id = ?');
    const total = totalStmt.get(formationId).total;
    
    const upcomingStmt = db.prepare(`
      SELECT COUNT(*) as total 
      FROM seances 
      WHERE formation_id = ? AND date_debut >= datetime('now')
    `);
    const upcoming = upcomingStmt.get(formationId).total;
    
    const byStatusStmt = db.prepare(`
      SELECT statut, COUNT(*) as count
      FROM seances
      WHERE formation_id = ?
      GROUP BY statut
    `);
    
    return {
      total,
      upcoming,
      byStatus: byStatusStmt.all(formationId)
    };
  }
} 