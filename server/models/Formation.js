import db from '../database/database.js';

export class Formation {
  static getAll() {
    const stmt = db.prepare('SELECT * FROM formations ORDER BY created_at DESC');
    return stmt.all();
  }

  static getById(id) {
    const stmt = db.prepare('SELECT * FROM formations WHERE id = ?');
    return stmt.get(id);
  }

  static create(data) {
    const stmt = db.prepare(`
      INSERT INTO formations (intitule, cible, objectifs_pedagogiques, contenu)
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(data.intitule, data.cible, data.objectifs_pedagogiques, data.contenu);
    return this.getById(result.lastInsertRowid);
  }

  static update(id, data) {
    const stmt = db.prepare(`
      UPDATE formations 
      SET intitule = ?, cible = ?, objectifs_pedagogiques = ?, contenu = ?
      WHERE id = ?
    `);
    const result = stmt.run(data.intitule, data.cible, data.objectifs_pedagogiques, data.contenu, id);
    return result.changes > 0 ? this.getById(id) : null;
  }

  static delete(id) {
    const stmt = db.prepare('DELETE FROM formations WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  static search(query) {
    const stmt = db.prepare(`
      SELECT * FROM formations 
      WHERE intitule LIKE ? OR cible LIKE ? OR objectifs_pedagogiques LIKE ? OR contenu LIKE ?
      ORDER BY created_at DESC
    `);
    const searchTerm = `%${query}%`;
    return stmt.all(searchTerm, searchTerm, searchTerm, searchTerm);
  }

  static getPopular() {
    const stmt = db.prepare(`
      SELECT f.*, COUNT(i.id) as inscription_count
      FROM formations f
      LEFT JOIN inscriptions i ON f.id = i.formation_id
      GROUP BY f.id
      ORDER BY inscription_count DESC, f.created_at DESC
      LIMIT 5
    `);
    return stmt.all();
  }

  static getPopularByEntreprise(entrepriseId) {
    const stmt = db.prepare(`
      SELECT f.*, COUNT(i.id) as inscription_count
      FROM formations f
      LEFT JOIN inscriptions i ON f.id = i.formation_id AND i.entreprise_id = ?
      WHERE i.entreprise_id = ? OR i.entreprise_id IS NULL
      GROUP BY f.id
      HAVING inscription_count > 0
      ORDER BY inscription_count DESC, f.created_at DESC
      LIMIT 5
    `);
    return stmt.all(entrepriseId, entrepriseId);
  }
}
