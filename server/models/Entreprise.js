import { db } from '../database/database.js';
import bcrypt from 'bcrypt';

export class Entreprise {
  static getAll() {
    const stmt = db.prepare(`
      SELECT e.*, 
             (SELECT COUNT(*) FROM employes emp WHERE emp.entreprise_id = e.id) as nombre_employes
      FROM entreprises e 
      ORDER BY raison_sociale ASC
    `);
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
    const normalizedEmail = (email || '').trim().toLowerCase();
    const stmt = db.prepare('SELECT * FROM entreprises WHERE TRIM(LOWER(email)) = ?');
    return stmt.get(normalizedEmail);
  }

  static async authenticate(email, password) {
    const normalizedEmail = (email || '').trim().toLowerCase();
    const stmt = db.prepare('SELECT * FROM entreprises WHERE TRIM(LOWER(email)) = ?');
    const entreprise = stmt.get(normalizedEmail);

    if (!entreprise) {
      return null;
    }

    // Handle case where password is null or undefined
    if (!entreprise.password) {
      return null;
    }

    // Check if password is hashed (starts with $2b$) or plain text
    let isValidPassword = false;
    if (entreprise.password.startsWith('$2b$')) {
      // Hashed password - use bcrypt
      isValidPassword = await bcrypt.compare(password, entreprise.password);
    } else {
      // Plain text password - direct comparison (for backward compatibility)
      isValidPassword = entreprise.password === password;

      // If valid, hash the password for future use
      if (isValidPassword) {
        const hashedPassword = await bcrypt.hash(password, 10);
        await this.updatePassword(entreprise.id, hashedPassword);
        entreprise.password = hashedPassword;
      }
    }

    return isValidPassword ? entreprise : null;
  }

  static async createWithPassword(data) {
    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const stmt = db.prepare(`
      INSERT INTO entreprises (raison_sociale, telephone, email, adresse, password)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      data.raison_sociale,
      data.telephone,
      (data.email || '').trim().toLowerCase(),
      data.adresse || null,
      hashedPassword
    );
    return this.getById(result.lastInsertRowid);
  }

  static async updatePassword(id, newPassword) {
    // Hash the new password before storing
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const stmt = db.prepare('UPDATE entreprises SET password = ? WHERE id = ?');
    const result = stmt.run(hashedPassword, id);
    return result.changes > 0;
  }

  static updateEmail(id, newEmail) {
    const normalizedEmail = (newEmail || '').trim().toLowerCase();
    const stmt = db.prepare('UPDATE entreprises SET email = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    const result = stmt.run(normalizedEmail, id);
    return result.changes > 0 ? this.getById(id) : null;
  }
}
