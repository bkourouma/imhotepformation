import { db } from '../database/database.js';
import { Participant } from './Participant.js';

export class Inscription {
  static getAll() {
    const stmt = db.prepare(`
      SELECT i.*, 
             e.raison_sociale as entreprise_nom,
             e.email as entreprise_email,
             f.intitule as formation_intitule,
             (SELECT COUNT(*) FROM participants p WHERE p.inscription_id = i.id) as nombre_participants
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
             f.contenu as formation_contenu,
             (SELECT COUNT(*) FROM participants p WHERE p.inscription_id = i.id) as nombre_participants
      FROM inscriptions i
      JOIN entreprises e ON i.entreprise_id = e.id
      JOIN formations f ON i.formation_id = f.id
      WHERE i.id = ?
    `);
    return stmt.get(id);
  }

  static create(data) {
    const stmt = db.prepare(`
      INSERT INTO inscriptions (entreprise_id, formation_id)
      VALUES (?, ?)
    `);

    const result = stmt.run(data.entreprise_id, data.formation_id);
    const inscriptionId = result.lastInsertRowid;

    // Créer les participants si fournis
    if (data.participants && data.participants.length > 0) {
      const participantsWithInscriptionId = data.participants.map(participant => ({
        ...participant,
        inscription_id: inscriptionId
      }));
      Participant.createMultiple(participantsWithInscriptionId);
    }

    return this.getById(inscriptionId);
  }

  static update(id, data) {
    const stmt = db.prepare(`
      UPDATE inscriptions
      SET entreprise_id = ?, formation_id = ?
      WHERE id = ?
    `);

    const result = stmt.run(data.entreprise_id, data.formation_id, id);
    
    if (result.changes > 0) {
      // Mettre à jour les participants si fournis
      if (data.participants) {
        // Supprimer les participants existants
        Participant.deleteByInscription(id);
        
        // Créer les nouveaux participants
        if (data.participants.length > 0) {
          const participantsWithInscriptionId = data.participants.map(participant => ({
            ...participant,
            inscription_id: id
          }));
          Participant.createMultiple(participantsWithInscriptionId);
        }
      }
      
      return this.getById(id);
    }
    
    return null;
  }

  static delete(id) {
    // Supprimer d'abord les participants
    Participant.deleteByInscription(id);
    
    const stmt = db.prepare('DELETE FROM inscriptions WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  static getByEntreprise(entrepriseId) {
    const stmt = db.prepare(`
      SELECT i.*, f.intitule as formation_intitule,
             (SELECT COUNT(*) FROM participants p WHERE p.inscription_id = i.id) as nombre_participants
      FROM inscriptions i
      JOIN formations f ON i.formation_id = f.id
      WHERE i.entreprise_id = ?
      ORDER BY i.created_at DESC
    `);
    return stmt.all(entrepriseId);
  }

  static getByFormation(formationId) {
    const stmt = db.prepare(`
      SELECT i.*, e.raison_sociale as entreprise_nom,
             (SELECT COUNT(*) FROM participants p WHERE p.inscription_id = i.id) as nombre_participants
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
             f.intitule as formation_intitule,
             (SELECT COUNT(*) FROM participants p WHERE p.inscription_id = i.id) as nombre_participants
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

    const participantsStmt = db.prepare('SELECT COUNT(*) as total FROM participants');
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

    const participantsStmt = db.prepare(`
      SELECT COUNT(*) as total 
      FROM participants p 
      JOIN inscriptions i ON p.inscription_id = i.id 
      WHERE i.entreprise_id = ?
    `);
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
             f.intitule as formation_intitule,
             (SELECT COUNT(*) FROM participants p WHERE p.inscription_id = i.id) as nombre_participants
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
      query += ' AND i.created_at >= ?';
      params.push(filters.date_debut);
    }

    if (filters.date_fin) {
      query += ' AND i.created_at <= ?';
      params.push(filters.date_fin);
    }

    query += ' ORDER BY i.created_at DESC';

    const stmt = db.prepare(query);
    return stmt.all(...params);
  }

  // Méthode pour récupérer une inscription avec ses participants
  static getByIdWithParticipants(id) {
    const inscription = this.getById(id);
    if (inscription) {
      inscription.participants = Participant.getByInscription(id);
    }
    return inscription;
  }

  // Méthode pour récupérer les inscriptions groupées par formation
  static getAllGroupedByFormation(filters = {}) {
    let query = `
      SELECT
        f.id as formation_id,
        f.intitule as formation_intitule,
        f.cible as formation_cible,
        COUNT(DISTINCT s.id) as nombre_seances,
        COUNT(DISTINCT p.id) as nombre_participants,
        MIN(s.created_at) as premiere_seance,
        MAX(s.created_at) as derniere_seance
      FROM formations f
      LEFT JOIN seances s ON f.id = s.formation_id
      LEFT JOIN groupes g ON s.id = g.seance_id
      LEFT JOIN participants p ON g.id = p.groupe_id
      WHERE 1=1
    `;
    
    const params = [];

    if (filters.formation_id) {
      query += ' AND f.id = ?';
      params.push(filters.formation_id);
    }

    if (filters.date_debut) {
      query += ' AND s.date_debut >= ?';
      params.push(filters.date_debut);
    }

    if (filters.date_fin) {
      query += ' AND s.date_fin <= ?';
      params.push(filters.date_fin);
    }

    query += `
      GROUP BY f.id, f.intitule, f.cible
      HAVING nombre_seances > 0
      ORDER BY derniere_seance DESC
    `;

    const stmt = db.prepare(query);
    return stmt.all(...params);
  }
}
