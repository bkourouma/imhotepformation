import { db } from '../database/database.js';
import { Seance } from './Seance.js';

export class Formation {
  static getAll(filters = {}) {
    let query = `
      SELECT f.*, 
             (SELECT COUNT(*) FROM seances s WHERE s.formation_id = f.id) as nombre_seances,
             (SELECT COUNT(*) FROM participants p 
              JOIN groupes g ON p.groupe_id = g.id 
              JOIN seances s ON g.seance_id = s.id 
              WHERE s.formation_id = f.id) as nombre_participants
      FROM formations f
      WHERE 1=1
    `;
    
    const params = [];

    if (filters.search) {
      query += ' AND (f.intitule LIKE ? OR f.cible LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm);
    }

    query += ' ORDER BY f.intitule';

    const stmt = db.prepare(query);
    return stmt.all(...params);
  }

  static getById(id) {
    const stmt = db.prepare(`
      SELECT f.*, 
             (SELECT COUNT(*) FROM seances s WHERE s.formation_id = f.id) as nombre_seances,
             (SELECT COUNT(*) FROM participants p 
              JOIN groupes g ON p.groupe_id = g.id 
              JOIN seances s ON g.seance_id = s.id 
              WHERE s.formation_id = f.id) as nombre_participants
      FROM formations f
      WHERE f.id = ?
    `);
    return stmt.get(id);
  }

  static create(data) {
    const stmt = db.prepare(`
      INSERT INTO formations (intitule, cible, objectifs_pedagogiques, contenu, duree, prix)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      data.intitule,
      data.cible,
      data.objectifs_pedagogiques,
      data.contenu,
      data.duree || null,
      data.prix || null
    );

    return this.getById(result.lastInsertRowid);
  }

  static update(id, data) {
    const stmt = db.prepare(`
      UPDATE formations
      SET intitule = ?, cible = ?, objectifs_pedagogiques = ?, contenu = ?, duree = ?, prix = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    const result = stmt.run(
      data.intitule,
      data.cible,
      data.objectifs_pedagogiques,
      data.contenu,
      data.duree || null,
      data.prix || null,
      id
    );

    if (result.changes > 0) {
      return this.getById(id);
    }
    
    return null;
  }

  static delete(id) {
    const stmt = db.prepare('DELETE FROM formations WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  static getWithSeances(id) {
    const formation = this.getById(id);
    if (formation) {
      formation.seances = Seance.getByFormation(id);
    }
    return formation;
  }

  static getPopular(limit = 5) {
    const stmt = db.prepare(`
      SELECT f.*, 
             COUNT(DISTINCT p.id) as total_participants,
             COUNT(DISTINCT s.id) as total_seances
      FROM formations f
      LEFT JOIN seances s ON f.id = s.formation_id
      LEFT JOIN groupes g ON s.id = g.seance_id
      LEFT JOIN participants p ON g.id = p.groupe_id
      GROUP BY f.id
      ORDER BY total_participants DESC, total_seances DESC
      LIMIT ?
    `);
    return stmt.all(limit);
  }

  static getPopularByEntreprise(entrepriseId, limit = 5) {
    const stmt = db.prepare(`
      SELECT f.*, 
             COUNT(DISTINCT p.id) as total_participants,
             COUNT(DISTINCT s.id) as total_seances
      FROM formations f
      LEFT JOIN seances s ON f.id = s.formation_id
      LEFT JOIN groupes g ON s.id = g.seance_id
      LEFT JOIN participants p ON g.id = p.groupe_id
      LEFT JOIN employes e ON p.employe_id = e.id
      WHERE e.entreprise_id = ?
      GROUP BY f.id
      ORDER BY total_participants DESC, total_seances DESC
      LIMIT ?
    `);
    return stmt.all(entrepriseId, limit);
  }

  static getStats() {
    const totalStmt = db.prepare('SELECT COUNT(*) as total FROM formations');
    const total = totalStmt.get().total;

    const participantsStmt = db.prepare(`
      SELECT f.intitule, COUNT(DISTINCT p.id) as participants
      FROM formations f
      LEFT JOIN seances s ON f.id = s.formation_id
      LEFT JOIN groupes g ON s.id = g.seance_id
      LEFT JOIN participants p ON g.id = p.groupe_id
      GROUP BY f.id
      ORDER BY participants DESC
    `);

    return {
      total,
      byParticipants: participantsStmt.all()
    };
  }

  static getStatsByEntreprise(entrepriseId) {
    const totalStmt = db.prepare(`
      SELECT COUNT(DISTINCT f.id) as total
      FROM formations f
      JOIN seances s ON f.id = s.formation_id
      JOIN groupes g ON s.id = g.seance_id
      JOIN participants p ON g.id = p.groupe_id
      JOIN employes e ON p.employe_id = e.id
      WHERE e.entreprise_id = ?
    `);
    const total = totalStmt.get(entrepriseId).total;

    const participantsStmt = db.prepare(`
      SELECT f.intitule, COUNT(DISTINCT p.id) as participants
      FROM formations f
      JOIN seances s ON f.id = s.formation_id
      JOIN groupes g ON s.id = g.seance_id
      JOIN participants p ON g.id = p.groupe_id
      JOIN employes e ON p.employe_id = e.id
      WHERE e.entreprise_id = ?
      GROUP BY f.id
      ORDER BY participants DESC
    `);

    return {
      total,
      byParticipants: participantsStmt.all(entrepriseId)
    };
  }

  static search(query) {
    return this.getAll({ search: query });
  }
}
