import { db } from '../database/database.js';

export class Groupe {
  static getAll(filters = {}) {
    let query = `
      SELECT g.*, s.description as seance_nom, s.date_debut as seance_date_debut,
             e.nom as enseignant_nom, e.prenom as enseignant_prenom,
             (SELECT COUNT(*) FROM participants p WHERE p.groupe_id = g.id) as participants_count
      FROM groupes g
      JOIN seances s ON g.seance_id = s.id
      JOIN formations f ON s.formation_id = f.id
      LEFT JOIN enseignants e ON g.enseignant_id = e.id
      WHERE 1=1
    `;
    
    const params = [];

    if (filters.seance_id) {
      query += ' AND g.seance_id = ?';
      params.push(filters.seance_id);
    }

    if (filters.search) {
      query += ' AND (g.libelle LIKE ? OR s.description LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm);
    }

    query += ' ORDER BY g.libelle ASC';

    const stmt = db.prepare(query);
    return stmt.all(...params);
  }

  static getById(id) {
    const stmt = db.prepare(`
      SELECT g.*, s.description as seance_nom, s.date_debut as seance_date_debut,
             f.intitule as formation_nom,
             e.nom as enseignant_nom, e.prenom as enseignant_prenom, e.email as enseignant_email,
             (SELECT COUNT(*) FROM participants p WHERE p.groupe_id = g.id) as participants_count
      FROM groupes g
      JOIN seances s ON g.seance_id = s.id
      JOIN formations f ON s.formation_id = f.id
      LEFT JOIN enseignants e ON g.enseignant_id = e.id
      WHERE g.id = ?
    `);
    return stmt.get(id);
  }

  static getBySeance(seanceId) {
    const stmt = db.prepare(`
      SELECT g.*, (SELECT COUNT(*) FROM participants p WHERE p.groupe_id = g.id) as participants_count
      FROM groupes g
      WHERE g.seance_id = ?
      ORDER BY g.libelle ASC
    `);
    return stmt.all(seanceId);
  }

  static getWithParticipants(groupeId) {
    const groupe = this.getById(groupeId);
    if (!groupe) return null;

    const participantsStmt = db.prepare(`
      SELECT p.*, e.nom, e.prenom, e.email, e.fonction, e.telephone, e.entreprise_id,
             ent.raison_sociale as entreprise_nom
      FROM participants p
      JOIN employes e ON p.employe_id = e.id
      LEFT JOIN entreprises ent ON e.entreprise_id = ent.id
      WHERE p.groupe_id = ?
      ORDER BY e.nom, e.prenom
    `);
    
    const participants = participantsStmt.all(groupeId);
    return {
      ...groupe,
      participants
    };
  }

  static create(data) {
    const stmt = db.prepare(`
      INSERT INTO groupes (seance_id, libelle, capacite_max, date_debut, date_fin, enseignant_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      data.seance_id,
      data.nom, // Map nom from frontend to libelle in database
      data.capacite || 20,
      data.date_debut || null,
      data.date_fin || null,
      data.enseignant_id || null
    );

    return this.getById(result.lastInsertRowid);
  }

  static update(id, data) {
    const stmt = db.prepare(`
      UPDATE groupes
      SET seance_id = ?, libelle = ?, capacite_max = ?, date_debut = ?, date_fin = ?, enseignant_id = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    const result = stmt.run(
      data.seance_id,
      data.nom, // Map nom from frontend to libelle in database
      data.capacite || 20,
      data.date_debut || null,
      data.date_fin || null,
      data.enseignant_id || null,
      id
    );

    if (result.changes > 0) {
      return this.getById(id);
    }

    return null;
  }

  static delete(id) {
    const stmt = db.prepare('DELETE FROM groupes WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  static getStats() {
    const totalStmt = db.prepare('SELECT COUNT(*) as total FROM groupes');
    const total = totalStmt.get().total;
    
    const withParticipantsStmt = db.prepare(`
      SELECT COUNT(*) as total 
      FROM groupes g
      WHERE EXISTS (SELECT 1 FROM participants p WHERE p.groupe_id = g.id)
    `);
    const withParticipants = withParticipantsStmt.get().total;
    
    const bySeanceStmt = db.prepare(`
      SELECT s.description as intitule, COUNT(g.id) as count
      FROM seances s
      LEFT JOIN groupes g ON s.id = g.seance_id
      GROUP BY s.id
      ORDER BY count DESC
    `);
    
    return {
      total,
      withParticipants,
      bySeance: bySeanceStmt.all()
    };
  }

  static getStatsBySeance(seanceId) {
    const totalStmt = db.prepare('SELECT COUNT(*) as total FROM groupes WHERE seance_id = ?');
    const total = totalStmt.get(seanceId).total;
    
    const withParticipantsStmt = db.prepare(`
      SELECT COUNT(*) as total 
      FROM groupes g
      WHERE g.seance_id = ? AND EXISTS (SELECT 1 FROM participants p WHERE p.groupe_id = g.id)
    `);
    const withParticipants = withParticipantsStmt.get(seanceId).total;
    
    const avgCapacityStmt = db.prepare(`
      SELECT AVG(capacite_max) as avg_capacity
      FROM groupes
      WHERE seance_id = ?
    `);
    const avgCapacity = avgCapacityStmt.get(seanceId).avg_capacity || 0;
    
    return {
      total,
      withParticipants,
      avgCapacity: Math.round(avgCapacity)
    };
  }
} 