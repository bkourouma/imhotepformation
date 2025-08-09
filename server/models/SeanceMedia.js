import { db } from '../database/database.js';
import fs from 'fs';
import path from 'path';

export class SeanceMedia {
  static getAll(filters = {}) {
    let query = `
      SELECT sm.*, s.description as seance_description
      FROM seance_media sm
      JOIN seances s ON sm.seance_id = s.id
      WHERE 1=1
    `;
    
    const params = [];

    if (filters.seance_id) {
      query += ' AND sm.seance_id = ?';
      params.push(filters.seance_id);
    }

    if (filters.file_type) {
      query += ' AND sm.file_type = ?';
      params.push(filters.file_type);
    }

    query += ' ORDER BY sm.created_at DESC';

    const stmt = db.prepare(query);
    return stmt.all(...params);
  }

  static getById(id) {
    const stmt = db.prepare(`
      SELECT sm.*, s.description as seance_description
      FROM seance_media sm
      JOIN seances s ON sm.seance_id = s.id
      WHERE sm.id = ?
    `);
    return stmt.get(id);
  }

  static getBySeance(seanceId) {
    const stmt = db.prepare(`
      SELECT * FROM seance_media
      WHERE seance_id = ?
      ORDER BY created_at DESC
    `);
    return stmt.all(seanceId);
  }

  static create(data) {
    const stmt = db.prepare(`
      INSERT INTO seance_media (
        seance_id, filename, original_name, file_type, mime_type, 
        file_size, file_path, title, description
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      data.seance_id,
      data.filename,
      data.original_name,
      data.file_type,
      data.mime_type,
      data.file_size,
      data.file_path,
      data.title || data.original_name,
      data.description || ''
    );

    return this.getById(result.lastInsertRowid);
  }

  static update(id, data) {
    const stmt = db.prepare(`
      UPDATE seance_media
      SET title = ?, description = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    const result = stmt.run(
      data.title,
      data.description,
      id
    );

    if (result.changes > 0) {
      return this.getById(id);
    }
    
    return null;
  }

  static delete(id) {
    // Get the media info first to delete the file
    const media = this.getById(id);
    if (!media) return false;

    // Delete the physical file
    try {
      if (fs.existsSync(media.file_path)) {
        fs.unlinkSync(media.file_path);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }

    // Delete the database record
    const stmt = db.prepare('DELETE FROM seance_media WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  static getFileTypeFromMimeType(mimeType) {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType === 'application/pdf') return 'pdf';
    if (mimeType.includes('powerpoint') || 
        mimeType.includes('presentation') ||
        mimeType === 'application/vnd.ms-powerpoint' ||
        mimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
      return 'powerpoint';
    }
    return 'other';
  }

  static isValidFileType(mimeType) {
    const validTypes = [
      // Images
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      // Videos
      'video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov',
      // PDF
      'application/pdf',
      // PowerPoint
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];
    
    return validTypes.includes(mimeType);
  }

  static getStats() {
    const totalStmt = db.prepare('SELECT COUNT(*) as total FROM seance_media');
    const total = totalStmt.get().total;
    
    const byTypeStmt = db.prepare(`
      SELECT file_type, COUNT(*) as count
      FROM seance_media
      GROUP BY file_type
      ORDER BY count DESC
    `);
    
    const sizeStmt = db.prepare(`
      SELECT SUM(file_size) as total_size
      FROM seance_media
    `);
    
    return {
      total,
      byType: byTypeStmt.all(),
      totalSize: sizeStmt.get().total_size || 0
    };
  }

  static getStatsBySeance(seanceId) {
    const totalStmt = db.prepare('SELECT COUNT(*) as total FROM seance_media WHERE seance_id = ?');
    const total = totalStmt.get(seanceId).total;
    
    const byTypeStmt = db.prepare(`
      SELECT file_type, COUNT(*) as count
      FROM seance_media
      WHERE seance_id = ?
      GROUP BY file_type
      ORDER BY count DESC
    `);
    
    return {
      total,
      byType: byTypeStmt.all(seanceId)
    };
  }
}
