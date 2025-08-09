import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { param, body, query, validationResult } from 'express-validator';
import { SeanceMedia } from '../models/SeanceMedia.js';

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Données invalides',
      details: errors.array()
    });
  }
  next();
};

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads', 'seance-media');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `seance-${req.params.seanceId || 'unknown'}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (SeanceMedia.isValidFileType(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non supporté'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

// GET /api/seance-media - Get all media files
router.get('/', [
  query('seance_id').optional().isInt({ min: 1 }),
  query('file_type').optional().isIn(['pdf', 'powerpoint', 'image', 'video'])
], handleValidationErrors, (req, res) => {
  try {
    const filters = {};
    
    if (req.query.seance_id) filters.seance_id = req.query.seance_id;
    if (req.query.file_type) filters.file_type = req.query.file_type;
    
    const media = SeanceMedia.getAll(filters);
    res.json(media);
  } catch (error) {
    console.error('Erreur lors de la récupération des médias:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des médias' });
  }
});

// GET /api/seance-media/:id - Get specific media file
router.get('/:id', [
  param('id').isInt({ min: 1 }).withMessage('ID invalide')
], handleValidationErrors, (req, res) => {
  try {
    const media = SeanceMedia.getById(req.params.id);
    
    if (!media) {
      return res.status(404).json({ error: 'Média non trouvé' });
    }
    
    res.json(media);
  } catch (error) {
    console.error('Erreur lors de la récupération du média:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du média' });
  }
});

// GET /api/seance-media/seance/:seanceId - Get media files for a specific seance
router.get('/seance/:seanceId', [
  param('seanceId').isInt({ min: 1 }).withMessage('ID séance invalide')
], handleValidationErrors, (req, res) => {
  try {
    const media = SeanceMedia.getBySeance(req.params.seanceId);
    res.json(media);
  } catch (error) {
    console.error('Erreur lors de la récupération des médias de la séance:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des médias de la séance' });
  }
});

// GET /api/seance-media/:id/download - Download/view media file
router.get('/:id/download', [
  param('id').isInt({ min: 1 }).withMessage('ID invalide')
], handleValidationErrors, (req, res) => {
  try {
    const media = SeanceMedia.getById(req.params.id);
    
    if (!media) {
      return res.status(404).json({ error: 'Média non trouvé' });
    }

    if (!fs.existsSync(media.file_path)) {
      return res.status(404).json({ error: 'Fichier non trouvé sur le serveur' });
    }

    // Set appropriate headers
    res.setHeader('Content-Type', media.mime_type);
    res.setHeader('Content-Disposition', `inline; filename="${media.original_name}"`);
    
    // Stream the file
    const fileStream = fs.createReadStream(media.file_path);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Erreur lors du téléchargement du média:', error);
    res.status(500).json({ error: 'Erreur lors du téléchargement du média' });
  }
});

// POST /api/seance-media/seance/:seanceId/upload - Upload media file
router.post('/seance/:seanceId/upload', [
  param('seanceId').isInt({ min: 1 }).withMessage('ID séance invalide')
], handleValidationErrors, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier fourni' });
    }

    const fileType = SeanceMedia.getFileTypeFromMimeType(req.file.mimetype);
    
    const mediaData = {
      seance_id: parseInt(req.params.seanceId),
      filename: req.file.filename,
      original_name: req.file.originalname,
      file_type: fileType,
      mime_type: req.file.mimetype,
      file_size: req.file.size,
      file_path: req.file.path,
      title: req.body.title || req.file.originalname,
      description: req.body.description || ''
    };

    const media = SeanceMedia.create(mediaData);
    res.status(201).json(media);
  } catch (error) {
    console.error('Erreur lors de l\'upload du média:', error);
    
    // Clean up uploaded file if database insert failed
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ error: 'Erreur lors de l\'upload du média' });
  }
});

// PUT /api/seance-media/:id - Update media metadata
router.put('/:id', [
  param('id').isInt({ min: 1 }).withMessage('ID invalide'),
  body('title').optional().isString().trim(),
  body('description').optional().isString().trim()
], handleValidationErrors, (req, res) => {
  try {
    const media = SeanceMedia.update(req.params.id, req.body);
    
    if (!media) {
      return res.status(404).json({ error: 'Média non trouvé' });
    }
    
    res.json(media);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du média:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du média' });
  }
});

// DELETE /api/seance-media/:id - Delete media file
router.delete('/:id', [
  param('id').isInt({ min: 1 }).withMessage('ID invalide')
], handleValidationErrors, (req, res) => {
  try {
    const success = SeanceMedia.delete(req.params.id);
    
    if (!success) {
      return res.status(404).json({ error: 'Média non trouvé' });
    }
    
    res.json({ message: 'Média supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du média:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du média' });
  }
});

// GET /api/seance-media/stats - Get media statistics
router.get('/stats/global', (req, res) => {
  try {
    const stats = SeanceMedia.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
});

// GET /api/seance-media/stats/seance/:seanceId - Get media statistics for a seance
router.get('/stats/seance/:seanceId', [
  param('seanceId').isInt({ min: 1 }).withMessage('ID séance invalide')
], handleValidationErrors, (req, res) => {
  try {
    const stats = SeanceMedia.getStatsBySeance(req.params.seanceId);
    res.json(stats);
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques de la séance:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques de la séance' });
  }
});

export default router;
