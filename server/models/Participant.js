import { db } from '../database/database.js';

export class Participant {
  static getAll(filters = {}) {
    let query = `
      SELECT p.*, e.nom, e.prenom, e.email, e.fonction, e.telephone, 
             ent.raison_sociale as entreprise_nom,
             g.libelle as groupe_libelle,
             s.description as seance_description, s.date_debut, s.date_fin,
             f.intitule as formation_intitule
      FROM participants p
      JOIN employes e ON p.employe_id = e.id
      JOIN entreprises ent ON e.entreprise_id = ent.id
      JOIN groupes g ON p.groupe_id = g.id
      JOIN seances s ON g.seance_id = s.id
      JOIN formations f ON s.formation_id = f.id
      WHERE 1=1
    `;
    
    const params = [];

    if (filters.employe_id) {
      query += ' AND p.employe_id = ?';
      params.push(filters.employe_id);
    }

    if (filters.groupe_id) {
      query += ' AND p.groupe_id = ?';
      params.push(filters.groupe_id);
    }

    if (filters.seance_id) {
      query += ' AND g.seance_id = ?';
      params.push(filters.seance_id);
    }

    if (filters.formation_id) {
      query += ' AND s.formation_id = ?';
      params.push(filters.formation_id);
    }

    if (filters.entreprise_id) {
      query += ' AND e.entreprise_id = ?';
      params.push(filters.entreprise_id);
    }

    if (filters.present !== undefined) {
      query += ' AND p.present = ?';
      params.push(filters.present ? 1 : 0);
    }

    query += ' ORDER BY e.nom, e.prenom';

    const stmt = db.prepare(query);
    return stmt.all(...params);
  }

  static getById(id) {
    const stmt = db.prepare(`
      SELECT p.*, e.nom, e.prenom, e.email, e.fonction, e.telephone,
             ent.raison_sociale as entreprise_nom,
             g.libelle as groupe_libelle,
             s.description as seance_description, s.date_debut, s.date_fin,
             f.intitule as formation_intitule
      FROM participants p
      JOIN employes e ON p.employe_id = e.id
      JOIN entreprises ent ON e.entreprise_id = ent.id
      JOIN groupes g ON p.groupe_id = g.id
      JOIN seances s ON g.seance_id = s.id
      JOIN formations f ON s.formation_id = f.id
      WHERE p.id = ?
    `);
    return stmt.get(id);
  }

  static getByEmploye(employeId) {
    const stmt = db.prepare(`
      SELECT p.*, g.libelle as groupe_libelle,
             s.description as seance_description, s.date_debut, s.date_fin,
             f.intitule as formation_intitule
      FROM participants p
      JOIN groupes g ON p.groupe_id = g.id
      JOIN seances s ON g.seance_id = s.id
      JOIN formations f ON s.formation_id = f.id
      WHERE p.employe_id = ?
      ORDER BY s.date_debut DESC
    `);
    return stmt.all(employeId);
  }

  static getByGroupe(groupeId) {
    const stmt = db.prepare(`
      SELECT p.*, e.nom, e.prenom, e.email, e.fonction, e.telephone,
             ent.raison_sociale as entreprise_nom
      FROM participants p
      JOIN employes e ON p.employe_id = e.id
      JOIN entreprises ent ON e.entreprise_id = ent.id
      WHERE p.groupe_id = ?
      ORDER BY e.nom, e.prenom
    `);
    return stmt.all(groupeId);
  }

  static create(data) {
    const stmt = db.prepare(`
      INSERT INTO participants (employe_id, groupe_id, present)
      VALUES (?, ?, ?)
    `);

    const result = stmt.run(
      data.employe_id,
      data.groupe_id,
      data.present || 0
    );

    return this.getById(result.lastInsertRowid);
  }

  static update(id, data) {
    const stmt = db.prepare(`
      UPDATE participants
      SET employe_id = ?, groupe_id = ?, present = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    const result = stmt.run(
      data.employe_id,
      data.groupe_id,
      data.present || 0,
      id
    );

    if (result.changes > 0) {
      return this.getById(id);
    }
    
    return null;
  }

  static delete(id) {
    const stmt = db.prepare('DELETE FROM participants WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  static markPresent(id) {
    const stmt = db.prepare(`
      UPDATE participants
      SET present = 1, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    const result = stmt.run(id);
    return result.changes > 0;
  }

  static markAbsent(id) {
    const stmt = db.prepare(`
      UPDATE participants
      SET present = 0, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    const result = stmt.run(id);
    return result.changes > 0;
  }

  static getStats() {
    const totalStmt = db.prepare('SELECT COUNT(*) as total FROM participants');
    const total = totalStmt.get().total;

    const presentStmt = db.prepare('SELECT COUNT(*) as count FROM participants WHERE present = 1');
    const present = presentStmt.get().count;

    const absentStmt = db.prepare('SELECT COUNT(*) as count FROM participants WHERE present = 0');
    const absent = absentStmt.get().count;

    return {
      total,
      present,
      absent,
      tauxPresence: total > 0 ? (present / total * 100).toFixed(2) : 0
    };
  }

  static getStatsByEntreprise(entrepriseId) {
    const totalStmt = db.prepare(`
      SELECT COUNT(p.id) as total
      FROM participants p
      JOIN employes e ON p.employe_id = e.id
      WHERE e.entreprise_id = ?
    `);
    const total = totalStmt.get(entrepriseId).total;

    const presentStmt = db.prepare(`
      SELECT COUNT(p.id) as count
      FROM participants p
      JOIN employes e ON p.employe_id = e.id
      WHERE e.entreprise_id = ? AND p.present = 1
    `);
    const present = presentStmt.get(entrepriseId).count;

    return {
      total,
      present,
      absent: total - present,
      tauxPresence: total > 0 ? (present / total * 100).toFixed(2) : 0
    };
  }

  static getStatsByFormation(formationId) {
    const totalStmt = db.prepare(`
      SELECT COUNT(p.id) as total
      FROM participants p
      JOIN groupes g ON p.groupe_id = g.id
      JOIN seances s ON g.seance_id = s.id
      WHERE s.formation_id = ?
    `);
    const total = totalStmt.get(formationId).total;

    const presentStmt = db.prepare(`
      SELECT COUNT(p.id) as count
      FROM participants p
      JOIN groupes g ON p.groupe_id = g.id
      JOIN seances s ON g.seance_id = s.id
      WHERE s.formation_id = ? AND p.present = 1
    `);
    const present = presentStmt.get(formationId).count;

    return {
      total,
      present,
      absent: total - present,
      tauxPresence: total > 0 ? (present / total * 100).toFixed(2) : 0
    };
  }

  // Presence management methods
  static getByGroupe(groupeId) {
    const stmt = db.prepare(`
      SELECT p.*, e.nom, e.prenom, e.email, e.fonction, e.telephone,
             ent.raison_sociale as entreprise_nom,
             g.libelle as groupe_libelle,
             s.description as seance_description, s.date_debut, s.date_fin,
             f.intitule as formation_intitule
      FROM participants p
      JOIN employes e ON p.employe_id = e.id
      JOIN entreprises ent ON e.entreprise_id = ent.id
      JOIN groupes g ON p.groupe_id = g.id
      JOIN seances s ON g.seance_id = s.id
      JOIN formations f ON s.formation_id = f.id
      WHERE p.groupe_id = ?
      ORDER BY e.nom, e.prenom
    `);
    return stmt.all(groupeId);
  }

  static updatePresence(participantId, present) {
    const stmt = db.prepare(`
      UPDATE participants
      SET present = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    const result = stmt.run(present ? 1 : 0, participantId);
    return result.changes > 0;
  }

  static updateMultiplePresence(presenceUpdates) {
    const stmt = db.prepare(`
      UPDATE participants
      SET present = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    const transaction = db.transaction((updates) => {
      for (const update of updates) {
        stmt.run(update.present ? 1 : 0, update.participantId);
      }
    });

    try {
      transaction(presenceUpdates);
      return true;
    } catch (error) {
      console.error('Error updating presence:', error);
      return false;
    }
  }

  static getPresenceStats(groupeId) {
    const stmt = db.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(present) as present,
        COUNT(*) - SUM(present) as absent
      FROM participants
      WHERE groupe_id = ?
    `);
    return stmt.get(groupeId);
  }

  static getPresenceByFormation(formationId) {
    const stmt = db.prepare(`
      SELECT p.*, e.nom, e.prenom, e.email, e.fonction,
             ent.raison_sociale as entreprise_nom,
             g.libelle as groupe_libelle,
             s.description as seance_description
      FROM participants p
      JOIN employes e ON p.employe_id = e.id
      JOIN entreprises ent ON e.entreprise_id = ent.id
      JOIN groupes g ON p.groupe_id = g.id
      JOIN seances s ON g.seance_id = s.id
      WHERE s.formation_id = ?
      ORDER BY s.date_debut, g.libelle, e.nom, e.prenom
    `);
    return stmt.all(formationId);
  }

  static getPresenceBySeance(seanceId) {
    const stmt = db.prepare(`
      SELECT p.*, e.nom, e.prenom, e.email, e.fonction,
             ent.raison_sociale as entreprise_nom,
             g.libelle as groupe_libelle
      FROM participants p
      JOIN employes e ON p.employe_id = e.id
      JOIN entreprises ent ON e.entreprise_id = ent.id
      JOIN groupes g ON p.groupe_id = g.id
      WHERE g.seance_id = ?
      ORDER BY g.libelle, e.nom, e.prenom
    `);
    return stmt.all(seanceId);
  }
}