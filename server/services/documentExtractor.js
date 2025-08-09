import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';

/**
 * Extract text content from various document types
 * @param {string} filePath - Path to the document file
 * @param {string} mimeType - MIME type of the file
 * @returns {Promise<string>} Extracted text content
 */
export async function extractDocumentContent(filePath, mimeType) {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Fichier non trouvé: ${filePath}`);
    }

    const fileBuffer = fs.readFileSync(filePath);
    
    switch (mimeType) {
      case 'application/pdf':
        // PDF extraction temporarily disabled - return placeholder
        return `Contenu PDF détecté: ${path.basename(filePath)}. Extraction complète sera disponible prochainement.`;

      case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
      case 'application/vnd.ms-powerpoint':
        return await extractPowerPointContent(fileBuffer, filePath);

      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      case 'application/msword':
        return await extractWordContent(fileBuffer);

      case 'text/plain':
        return fileBuffer.toString('utf-8');

      default:
        throw new Error(`Type de fichier non supporté: ${mimeType}`);
    }
  } catch (error) {
    console.error('Erreur lors de l\'extraction du contenu:', error);
    throw new Error(`Erreur lors de l'extraction du contenu: ${error.message}`);
  }
}

/**
 * Extract text from PDF files (placeholder implementation)
 */
async function extractPDFContent(buffer) {
  // PDF extraction temporarily disabled due to library issues
  return 'Contenu PDF détecté. Extraction complète sera disponible prochainement.';
}

/**
 * Extract text from Word documents
 */
async function extractWordContent(buffer) {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    throw new Error(`Erreur lors de l'extraction du document Word: ${error.message}`);
  }
}

/**
 * Extract text from PowerPoint files
 * Note: This is a simplified extraction. For better PowerPoint support,
 * you might want to use a more specialized library
 */
async function extractPowerPointContent(buffer, filePath) {
  try {
    // For PowerPoint files, we'll try to extract what we can
    // This is a basic implementation - you might want to use a more specialized library
    
    const fileExtension = path.extname(filePath).toLowerCase();
    
    if (fileExtension === '.pptx') {
      // For .pptx files, we can try to extract using a zip-based approach
      return await extractPPTXContent(buffer);
    } else {
      // For older .ppt files, return a placeholder
      return 'Contenu PowerPoint détecté. Extraction complète non disponible pour ce format.';
    }
  } catch (error) {
    console.warn('Erreur lors de l\'extraction PowerPoint:', error);
    return 'Contenu PowerPoint détecté. Extraction du texte non disponible.';
  }
}

/**
 * Extract text from PPTX files using basic zip extraction
 */
async function extractPPTXContent(buffer) {
  try {
    // This is a simplified approach. For production, consider using a dedicated library
    // like 'officegen' or 'node-pptx'
    
    // For now, return a placeholder that indicates PowerPoint content was found
    return 'Contenu de présentation PowerPoint détecté. Veuillez vous assurer que le contenu principal est couvert dans d\'autres documents ou ajouter manuellement les points clés.';
  } catch (error) {
    throw new Error(`Erreur lors de l'extraction PPTX: ${error.message}`);
  }
}

/**
 * Extract content from multiple media files for a seance
 * @param {Array} mediaFiles - Array of media file objects with file_path and mime_type
 * @returns {Promise<string>} Combined text content from all files
 */
export async function extractSeanceContent(mediaFiles) {
  if (!mediaFiles || mediaFiles.length === 0) {
    throw new Error('Aucun fichier média trouvé pour cette séance');
  }

  const extractedContents = [];
  const errors = [];

  for (const media of mediaFiles) {
    try {
      const content = await extractDocumentContent(media.file_path, media.mime_type);
      if (content && content.trim().length > 0) {
        extractedContents.push({
          filename: media.original_name || media.filename,
          content: content.trim()
        });
      }
    } catch (error) {
      console.warn(`Erreur lors de l'extraction de ${media.original_name}:`, error.message);
      errors.push({
        filename: media.original_name || media.filename,
        error: error.message
      });
    }
  }

  if (extractedContents.length === 0) {
    throw new Error('Aucun contenu textuel n\'a pu être extrait des fichiers média');
  }

  // Combine all extracted content
  let combinedContent = '';
  
  extractedContents.forEach((item, index) => {
    combinedContent += `\n\n=== DOCUMENT ${index + 1}: ${item.filename} ===\n`;
    combinedContent += item.content;
  });

  // Add information about any extraction errors
  if (errors.length > 0) {
    combinedContent += '\n\n=== NOTES D\'EXTRACTION ===\n';
    combinedContent += 'Les fichiers suivants n\'ont pas pu être traités:\n';
    errors.forEach(error => {
      combinedContent += `- ${error.filename}: ${error.error}\n`;
    });
  }

  return combinedContent.trim();
}

/**
 * Get supported file types for content extraction
 */
export function getSupportedFileTypes() {
  return [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'text/plain'
  ];
}

/**
 * Check if a file type is supported for content extraction
 */
export function isFileTypeSupported(mimeType) {
  return getSupportedFileTypes().includes(mimeType);
}

/**
 * Get a summary of what content can be extracted from media files
 */
export function getExtractionSummary(mediaFiles) {
  const summary = {
    total: mediaFiles.length,
    supported: 0,
    unsupported: 0,
    supportedFiles: [],
    unsupportedFiles: []
  };

  mediaFiles.forEach(media => {
    if (isFileTypeSupported(media.mime_type)) {
      summary.supported++;
      summary.supportedFiles.push({
        name: media.original_name || media.filename,
        type: media.file_type
      });
    } else {
      summary.unsupported++;
      summary.unsupportedFiles.push({
        name: media.original_name || media.filename,
        type: media.file_type,
        mimeType: media.mime_type
      });
    }
  });

  return summary;
}
