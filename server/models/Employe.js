import { db } from '../database/database.js';

// Helper function to generate password from initials
function generatePassword(prenom, nom) {
  const initials = (prenom.charAt(0) + nom.charAt(0)).toLowerCase();
  const randomNumber = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
  return initials + randomNumber;
}

export class Employe {
  static getAll(filters = {}) {
    let query = `
      SELECT e.*, ent.raison_sociale as entreprise_nom
      FROM employes e
      JOIN entreprises ent ON e.entreprise_id = ent.id
      WHERE 1=1
    `;
    
    const params = [];

    if (filters.entreprise_id) {
      query += ' AND e.entreprise_id = ?';
      params.push(filters.entreprise_id);
    }

    if (filters.search) {
      query += ' AND (e.nom LIKE ? OR e.prenom LIKE ? OR e.email LIKE ? OR e.fonction LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY e.nom, e.prenom';

    const stmt = db.prepare(query);
    return stmt.all(...params);
  }

  static getById(id) {
    const stmt = db.prepare(`
      SELECT e.*, ent.raison_sociale as entreprise_nom, ent.email as entreprise_email
      FROM employes e
      JOIN entreprises ent ON e.entreprise_id = ent.id
      WHERE e.id = ?
    `);
    return stmt.get(id);
  }

  static getByEntreprise(entrepriseId) {
    const stmt = db.prepare(`
      SELECT e.*
      FROM employes e
      WHERE e.entreprise_id = ?
      ORDER BY e.nom, e.prenom
    `);
    return stmt.all(entrepriseId);
  }

  static create(data) {
    // Generate password if not provided
    const password = data.password || generatePassword(data.prenom, data.nom);

    try {
      const stmt = db.prepare(`
        INSERT INTO employes (entreprise_id, nom, prenom, email, fonction, telephone, password)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
        data.entreprise_id,
        data.nom,
        data.prenom,
        data.email,
        data.fonction,
        data.telephone,
        password
      );

      return this.getById(result.lastInsertRowid);
    } catch (error) {
      // If password column doesn't exist, try without it
      if (error.message.includes('no column named password')) {
        const stmt = db.prepare(`
          INSERT INTO employes (entreprise_id, nom, prenom, email, fonction, telephone)
          VALUES (?, ?, ?, ?, ?, ?)
        `);

        const result = stmt.run(
          data.entreprise_id,
          data.nom,
          data.prenom,
          data.email,
          data.fonction,
          data.telephone
        );

        // Try to update with password after creation
        try {
          const updateStmt = db.prepare(`UPDATE employes SET password = ? WHERE id = ?`);
          updateStmt.run(password, result.lastInsertRowid);
        } catch (updateError) {
          // Ignore if password column doesn't exist
        }

        return this.getById(result.lastInsertRowid);
      }
      throw error;
    }
  }

  static update(id, data) {
    // If password is provided, use it; otherwise keep the existing one
    let updateQuery = `
      UPDATE employes
      SET entreprise_id = ?, nom = ?, prenom = ?, email = ?, fonction = ?, telephone = ?, updated_at = CURRENT_TIMESTAMP
    `;

    const params = [
      data.entreprise_id,
      data.nom,
      data.prenom,
      data.email,
      data.fonction,
      data.telephone
    ];

    // Only update password if provided
    if (data.password) {
      updateQuery += ', password = ?';
      params.push(data.password);
    }

    updateQuery += ' WHERE id = ?';
    params.push(id);

    const stmt = db.prepare(updateQuery);
    const result = stmt.run(...params);

    if (result.changes > 0) {
      return this.getById(id);
    }

    return null;
  }

  static delete(id) {
    const stmt = db.prepare('DELETE FROM employes WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  static getStats() {
    const totalStmt = db.prepare('SELECT COUNT(*) as total FROM employes');
    const total = totalStmt.get().total;

    const totalParticipantsStmt = db.prepare('SELECT COUNT(*) as total FROM employes');
    const totalParticipants = totalParticipantsStmt.get().total;

    const thisMonthStmt = db.prepare(`
      SELECT COUNT(*) as total 
      FROM employes 
      WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')
    `);
    const thisMonth = thisMonthStmt.get().total;

    const byEntrepriseStmt = db.prepare(`
      SELECT ent.raison_sociale, COUNT(e.id) as count
      FROM entreprises ent
      LEFT JOIN employes e ON ent.id = e.entreprise_id
      GROUP BY ent.id
      ORDER BY count DESC
    `);

    return {
      total,
      totalParticipants,
      thisMonth,
      byEntreprise: byEntrepriseStmt.all()
    };
  }

  static getStatsByEntreprise(entrepriseId) {
    const totalStmt = db.prepare('SELECT COUNT(*) as total FROM employes WHERE entreprise_id = ?');
    const total = totalStmt.get(entrepriseId).total;

    const totalParticipantsStmt = db.prepare('SELECT COUNT(*) as total FROM employes WHERE entreprise_id = ?');
    const totalParticipants = totalParticipantsStmt.get(entrepriseId).total;

    const thisMonthStmt = db.prepare(`
      SELECT COUNT(*) as total 
      FROM employes 
      WHERE entreprise_id = ? AND strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')
    `);
    const thisMonth = thisMonthStmt.get(entrepriseId).total;

    const byFonctionStmt = db.prepare(`
      SELECT fonction, COUNT(*) as count
      FROM employes
      WHERE entreprise_id = ?
      GROUP BY fonction
      ORDER BY count DESC
    `);

    return {
      total,
      totalParticipants,
      thisMonth,
      byFonction: byFonctionStmt.all(entrepriseId)
    };
  }

  // Authentication methods
  static async authenticate(email, password) {
    const stmt = db.prepare(`
      SELECT e.*, ent.raison_sociale as entreprise_nom, ent.email as entreprise_email
      FROM employes e
      JOIN entreprises ent ON e.entreprise_id = ent.id
      WHERE e.email = ?
    `);
    const employe = stmt.get(email);

    if (!employe) {
      return null;
    }

    // Handle case where password is null or undefined
    if (!employe.password) {
      return null;
    }

    // Check if password is hashed (starts with $2b$) or plain text
    let isValidPassword = false;
    if (employe.password.startsWith('$2b$')) {
      // Hashed password - use bcrypt
      const bcrypt = await import('bcrypt');
      isValidPassword = await bcrypt.compare(password, employe.password);
    } else {
      // Plain text password - direct comparison (for backward compatibility)
      isValidPassword = employe.password === password;

      // If valid, hash the password for future use
      if (isValidPassword) {
        const bcrypt = await import('bcrypt');
        const hashedPassword = await bcrypt.hash(password, 10);
        await this.updatePassword(employe.id, hashedPassword);
        employe.password = hashedPassword;
      }
    }

    return isValidPassword ? employe : null;
  }

  static getByEmail(email) {
    const stmt = db.prepare(`
      SELECT e.*, ent.raison_sociale as entreprise_nom, ent.email as entreprise_email
      FROM employes e
      JOIN entreprises ent ON e.entreprise_id = ent.id
      WHERE e.email = ?
    `);
    return stmt.get(email);
  }

  static async updatePassword(id, newPassword) {
    try {
      const stmt = db.prepare('UPDATE employes SET password = ? WHERE id = ?');
      const result = stmt.run(newPassword, id);
      return result.changes > 0;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du mot de passe:', error);
      return false;
    }
  }

  static getFormationsByEmploye(employeId) {
    const stmt = db.prepare(`
      SELECT DISTINCT
        f.id as formation_id,
        f.intitule as formation_nom,
        f.cible as formation_cible,
        s.id as seance_id,
        s.description as seance_description,
        s.date_debut,
        s.date_fin,
        s.lieu,
        COUNT(sm.id) as media_count
      FROM formations f
      JOIN seances s ON f.id = s.formation_id
      JOIN groupes g ON s.id = g.seance_id
      JOIN participants p ON g.id = p.groupe_id
      LEFT JOIN seance_media sm ON s.id = sm.seance_id
      WHERE p.employe_id = ?
      GROUP BY f.id, s.id
      ORDER BY s.date_debut DESC
    `);
    return stmt.all(employeId);
  }

  static getSeancesByEmploye(employeId) {
    const stmt = db.prepare(`
      SELECT DISTINCT
        s.id as seance_id,
        s.description as seance_description,
        s.date_debut,
        s.date_fin,
        s.lieu,
        f.id as formation_id,
        f.intitule as formation_nom,
        COUNT(sm.id) as media_count
      FROM seances s
      JOIN formations f ON s.formation_id = f.id
      JOIN groupes g ON s.id = g.seance_id
      JOIN participants p ON g.id = p.groupe_id
      LEFT JOIN seance_media sm ON s.id = sm.seance_id
      WHERE p.employe_id = ?
      GROUP BY s.id
      ORDER BY s.date_debut DESC
    `);
    return stmt.all(employeId);
  }
} 