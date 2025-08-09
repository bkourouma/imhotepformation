import { db } from '../database/database.js';

export class MediaAccessHistory {
  static create(data) {
    const stmt = db.prepare(`
      INSERT INTO media_access_history (employe_id, seance_media_id, ip_address, user_agent)
      VALUES (?, ?, ?, ?)
    `);

    const result = stmt.run(
      data.employe_id,
      data.seance_media_id,
      data.ip_address || null,
      data.user_agent || null
    );

    return result.lastInsertRowid;
  }

  static getByEmploye(employeId, limit = 50) {
    const stmt = db.prepare(`
      SELECT 
        mah.*,
        sm.title as media_title,
        sm.original_name as media_filename,
        sm.file_type as media_type,
        s.description as seance_description,
        f.intitule as formation_nom
      FROM media_access_history mah
      JOIN seance_media sm ON mah.seance_media_id = sm.id
      JOIN seances s ON sm.seance_id = s.id
      JOIN formations f ON s.formation_id = f.id
      WHERE mah.employe_id = ?
      ORDER BY mah.access_date DESC
      LIMIT ?
    `);
    return stmt.all(employeId, limit);
  }

  static getBySeanceMedia(seanceMediaId) {
    const stmt = db.prepare(`
      SELECT 
        mah.*,
        e.nom as employe_nom,
        e.prenom as employe_prenom,
        e.email as employe_email,
        ent.raison_sociale as entreprise_nom
      FROM media_access_history mah
      JOIN employes e ON mah.employe_id = e.id
      JOIN entreprises ent ON e.entreprise_id = ent.id
      WHERE mah.seance_media_id = ?
      ORDER BY mah.access_date DESC
    `);
    return stmt.all(seanceMediaId);
  }

  static getStats() {
    const totalStmt = db.prepare('SELECT COUNT(*) as total FROM media_access_history');
    const total = totalStmt.get().total;
    
    const todayStmt = db.prepare(`
      SELECT COUNT(*) as total 
      FROM media_access_history 
      WHERE date(access_date) = date('now')
    `);
    const today = todayStmt.get().total;
    
    const byEmployeStmt = db.prepare(`
      SELECT 
        e.nom, e.prenom, e.email,
        COUNT(mah.id) as access_count
      FROM employes e
      LEFT JOIN media_access_history mah ON e.id = mah.employe_id
      GROUP BY e.id
      ORDER BY access_count DESC
      LIMIT 10
    `);
    
    return {
      total,
      today,
      byEmploye: byEmployeStmt.all()
    };
  }
}
