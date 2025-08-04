import db from '../database/database.js';

export class Inscription {
  static getAll() {
    const stmt = db.prepare(`
      SELECT i.*, 
             e.raison_sociale as entreprise_nom,
             e.email as entreprise_email,
             f.intitule as formation_intitule
      FROM inscriptions i
      JOIN entreprises e ON i.entreprise_id = e.id
      JOIN formations f ON i.formation_id = f.id
      ORDER BY i.created_at DESC
    `);
    return stmt.all();
  }

  static getById(id) {
    const stmt = db.prepare(`
      SELECT i.*, 
             e.raison_sociale as entreprise_nom,
             e.email as entreprise_email,
             e.telephone as entreprise_telephone,
             f.intitule as formation_intitule,
             f.cible as formation_cible,
             f.objectifs_pedagogiques as formation_objectifs,
             f.contenu as formation_contenu
      FROM inscriptions i
      JOIN entreprises e ON i.entreprise_id = e.id
      JOIN formations f ON i.formation_id = f.id
      WHERE i.id = ?
    `);
    return stmt.get(id);
  }

  static create(data) {
    const stmt = db.prepare(`
      INSERT INTO inscriptions (entreprise_id, formation_id, nombre_participants, date_souhaitee)
      VALUES (?, ?, ?, ?)
    `);

    // Convertir la date en chaîne si c'est un objet Date
    const dateSouhaitee = data.date_souhaitee instanceof Date
      ? data.date_souhaitee.toISOString().split('T')[0]
      : data.date_souhaitee;

    const result = stmt.run(data.entreprise_id, data.formation_id, data.nombre_participants, dateSouhaitee);
    return this.getById(result.lastInsertRowid);
  }

  static update(id, data) {
    const stmt = db.prepare(`
      UPDATE inscriptions
      SET entreprise_id = ?, formation_id = ?, nombre_participants = ?, date_souhaitee = ?
      WHERE id = ?
    `);

    // Convertir la date en chaîne si c'est un objet Date
    const dateSouhaitee = data.date_souhaitee instanceof Date
      ? data.date_souhaitee.toISOString().split('T')[0]
      : data.date_souhaitee;

    const result = stmt.run(data.entreprise_id, data.formation_id, data.nombre_participants, dateSouhaitee, id);
    return result.changes > 0 ? this.getById(id) : null;
  }

  static delete(id) {
    const stmt = db.prepare('DELETE FROM inscriptions WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  static getByEntreprise(entrepriseId) {
    const stmt = db.prepare(`
      SELECT i.*, f.intitule as formation_intitule
      FROM inscriptions i
      JOIN formations f ON i.formation_id = f.id
      WHERE i.entreprise_id = ?
      ORDER BY i.created_at DESC
    `);
    return stmt.all(entrepriseId);
  }

  static getByFormation(formationId) {
    const stmt = db.prepare(`
      SELECT i.*, e.raison_sociale as entreprise_nom
      FROM inscriptions i
      JOIN entreprises e ON i.entreprise_id = e.id
      WHERE i.formation_id = ?
      ORDER BY i.created_at DESC
    `);
    return stmt.all(formationId);
  }

  static getRecent(limit = 5) {
    const stmt = db.prepare(`
      SELECT i.*, 
             e.raison_sociale as entreprise_nom,
             f.intitule as formation_intitule
      FROM inscriptions i
      JOIN entreprises e ON i.entreprise_id = e.id
      JOIN formations f ON i.formation_id = f.id
      ORDER BY i.created_at DESC
      LIMIT ?
    `);
    return stmt.all(limit);
  }

  static getStats() {
    const totalStmt = db.prepare('SELECT COUNT(*) as total FROM inscriptions');
    const total = totalStmt.get().total;

    const participantsStmt = db.prepare('SELECT SUM(nombre_participants) as total FROM inscriptions');
    const totalParticipants = participantsStmt.get().total || 0;

    const thisMonthStmt = db.prepare(`
      SELECT COUNT(*) as total
      FROM inscriptions
      WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')
    `);
    const thisMonth = thisMonthStmt.get().total;

    return {
      total,
      totalParticipants,
      thisMonth
    };
  }

  static getStatsByEntreprise(entrepriseId) {
    const totalStmt = db.prepare('SELECT COUNT(*) as total FROM inscriptions WHERE entreprise_id = ?');
    const total = totalStmt.get(entrepriseId).total;

    const participantsStmt = db.prepare('SELECT SUM(nombre_participants) as total FROM inscriptions WHERE entreprise_id = ?');
    const totalParticipants = participantsStmt.get(entrepriseId).total || 0;

    const thisMonthStmt = db.prepare(`
      SELECT COUNT(*) as total
      FROM inscriptions
      WHERE entreprise_id = ? AND strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')
    `);
    const thisMonth = thisMonthStmt.get(entrepriseId).total;

    return {
      total,
      totalParticipants,
      thisMonth
    };
  }

  static filter(filters) {
    let query = `
      SELECT i.*, 
             e.raison_sociale as entreprise_nom,
             e.email as entreprise_email,
             f.intitule as formation_intitule
      FROM inscriptions i
      JOIN entreprises e ON i.entreprise_id = e.id
      JOIN formations f ON i.formation_id = f.id
      WHERE 1=1
    `;
    
    const params = [];

    if (filters.entreprise_id) {
      query += ' AND i.entreprise_id = ?';
      params.push(filters.entreprise_id);
    }

    if (filters.formation_id) {
      query += ' AND i.formation_id = ?';
      params.push(filters.formation_id);
    }

    if (filters.date_debut) {
      query += ' AND i.date_souhaitee >= ?';
      params.push(filters.date_debut);
    }

    if (filters.date_fin) {
      query += ' AND i.date_souhaitee <= ?';
      params.push(filters.date_fin);
    }

    query += ' ORDER BY i.created_at DESC';

    const stmt = db.prepare(query);
    return stmt.all(...params);
  }
}
