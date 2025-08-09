import { db } from '../database/database.js';

export class Enseignant {
  static getAll(filters = {}) {
    let query = `
      SELECT *
      FROM enseignants
      WHERE 1=1
    `;
    
    const params = [];

    if (filters.actif !== undefined) {
      query += ' AND actif = ?';
      params.push(filters.actif);
    }

    if (filters.search) {
      query += ' AND (nom LIKE ? OR prenom LIKE ? OR email LIKE ? OR specialites LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY nom, prenom';

    const stmt = db.prepare(query);
    const enseignants = stmt.all(...params);
    
    // Parse specialites JSON for each enseignant
    return enseignants.map(enseignant => ({
      ...enseignant,
      specialites: enseignant.specialites ? JSON.parse(enseignant.specialites) : []
    }));
  }

  static getById(id) {
    const stmt = db.prepare('SELECT * FROM enseignants WHERE id = ?');
    const enseignant = stmt.get(id);
    
    if (enseignant) {
      enseignant.specialites = enseignant.specialites ? JSON.parse(enseignant.specialites) : [];
    }
    
    return enseignant;
  }

  static getActive() {
    return this.getAll({ actif: 1 });
  }

  static create(data) {
    const stmt = db.prepare(`
      INSERT INTO enseignants (nom, prenom, email, telephone, specialites, bio, actif)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const specialitesJson = Array.isArray(data.specialites) ? JSON.stringify(data.specialites) : data.specialites;

    const result = stmt.run(
      data.nom,
      data.prenom,
      data.email,
      data.telephone || null,
      specialitesJson || null,
      data.bio || null,
      data.actif !== undefined ? (data.actif ? 1 : 0) : 1
    );

    return this.getById(result.lastInsertRowid);
  }

  static update(id, data) {
    const stmt = db.prepare(`
      UPDATE enseignants
      SET nom = ?, prenom = ?, email = ?, telephone = ?, specialites = ?, bio = ?, actif = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    const specialitesJson = Array.isArray(data.specialites) ? JSON.stringify(data.specialites) : data.specialites;

    const result = stmt.run(
      data.nom,
      data.prenom,
      data.email,
      data.telephone || null,
      specialitesJson || null,
      data.bio || null,
      data.actif !== undefined ? (data.actif ? 1 : 0) : 1,
      id
    );

    if (result.changes > 0) {
      return this.getById(id);
    }
    
    return null;
  }

  static delete(id) {
    // Check if enseignant is assigned to any groups
    const groupsStmt = db.prepare('SELECT COUNT(*) as count FROM groupes WHERE enseignant_id = ?');
    const groupsCount = groupsStmt.get(id);
    
    if (groupsCount.count > 0) {
      throw new Error('Impossible de supprimer cet enseignant car il est assigné à des groupes');
    }

    const stmt = db.prepare('DELETE FROM enseignants WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  static search(query) {
    return this.getAll({ search: query });
  }

  static getByEmail(email) {
    const stmt = db.prepare('SELECT * FROM enseignants WHERE email = ?');
    const enseignant = stmt.get(email);
    
    if (enseignant) {
      enseignant.specialites = enseignant.specialites ? JSON.parse(enseignant.specialites) : [];
    }
    
    return enseignant;
  }

  static getStats() {
    const totalStmt = db.prepare('SELECT COUNT(*) as total FROM enseignants');
    const total = totalStmt.get().total;
    
    const activeStmt = db.prepare('SELECT COUNT(*) as total FROM enseignants WHERE actif = 1');
    const active = activeStmt.get().total;
    
    const withGroupsStmt = db.prepare(`
      SELECT COUNT(DISTINCT enseignant_id) as total 
      FROM groupes 
      WHERE enseignant_id IS NOT NULL
    `);
    const withGroups = withGroupsStmt.get().total;
    
    return {
      total,
      active,
      withGroups
    };
  }

  static getWithGroups(enseignantId) {
    try {
      const enseignant = this.getById(enseignantId);
      if (!enseignant) return null;

      const groupesStmt = db.prepare(`
        SELECT g.*, s.description as seance_description, s.date_debut, s.date_fin,
               f.intitule as formation_intitule,
               (SELECT COUNT(*) FROM participants p WHERE p.groupe_id = g.id) as participants_count
        FROM groupes g
        JOIN seances s ON g.seance_id = s.id
        JOIN formations f ON s.formation_id = f.id
        WHERE g.enseignant_id = ?
        ORDER BY s.date_debut DESC
      `);
      
      const groupes = groupesStmt.all(enseignantId);
      return {
        ...enseignant,
        groupes
      };
    } catch (error) {
      console.error('Erreur dans getWithGroups:', error);
      // Return enseignant without groups if there's an error
      const enseignant = this.getById(enseignantId);
      if (!enseignant) return null;
      
      return {
        ...enseignant,
        groupes: []
      };
    }
  }
}

export default Enseignant;
