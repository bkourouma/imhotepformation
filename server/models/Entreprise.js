import db from '../database/database.js';

export class Entreprise {
  static getAll() {
    const stmt = db.prepare('SELECT * FROM entreprises ORDER BY raison_sociale ASC');
    return stmt.all();
  }

  static getById(id) {
    const stmt = db.prepare('SELECT * FROM entreprises WHERE id = ?');
    return stmt.get(id);
  }

  static create(data) {
    const stmt = db.prepare(`
      INSERT INTO entreprises (raison_sociale, telephone, email)
      VALUES (?, ?, ?)
    `);
    const result = stmt.run(data.raison_sociale, data.telephone, data.email);
    return this.getById(result.lastInsertRowid);
  }

  static update(id, data) {
    const stmt = db.prepare(`
      UPDATE entreprises 
      SET raison_sociale = ?, telephone = ?, email = ?
      WHERE id = ?
    `);
    const result = stmt.run(data.raison_sociale, data.telephone, data.email, id);
    return result.changes > 0 ? this.getById(id) : null;
  }

  static delete(id) {
    // Vérifier s'il y a des inscriptions liées
    const inscriptionsStmt = db.prepare('SELECT COUNT(*) as count FROM inscriptions WHERE entreprise_id = ?');
    const inscriptionsCount = inscriptionsStmt.get(id);
    
    if (inscriptionsCount.count > 0) {
      throw new Error('Impossible de supprimer cette entreprise car elle a des inscriptions associées');
    }

    const stmt = db.prepare('DELETE FROM entreprises WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  static search(query) {
    const stmt = db.prepare(`
      SELECT * FROM entreprises 
      WHERE raison_sociale LIKE ? OR email LIKE ? OR telephone LIKE ?
      ORDER BY raison_sociale ASC
    `);
    const searchTerm = `%${query}%`;
    return stmt.all(searchTerm, searchTerm, searchTerm);
  }

  static getWithInscriptions(id) {
    const entreprise = this.getById(id);
    if (!entreprise) return null;

    const inscriptionsStmt = db.prepare(`
      SELECT i.*, f.intitule as formation_intitule
      FROM inscriptions i
      JOIN formations f ON i.formation_id = f.id
      WHERE i.entreprise_id = ?
      ORDER BY i.created_at DESC
    `);
    
    entreprise.inscriptions = inscriptionsStmt.all(id);
    return entreprise;
  }

  static getByEmail(email) {
    const stmt = db.prepare('SELECT * FROM entreprises WHERE email = ?');
    return stmt.get(email);
  }
}
