import { generateQuestionsFromContent } from './openaiService.js';
import { extractSeanceContent, getExtractionSummary } from './documentExtractor.js';
import { SeanceMedia } from '../models/SeanceMedia.js';

/**
 * Generate AI-powered evaluation questions for a seance
 * @param {number} seanceId - ID of the seance
 * @param {number} numberOfQuestions - Number of questions to generate (default: 20)
 * @returns {Promise<Object>} Generated questions and metadata
 */
export async function generateEvaluationQuestions(seanceId, numberOfQuestions = 20) {
  try {
    console.log(`🤖 Génération de ${numberOfQuestions} questions pour la séance ${seanceId}...`);
    
    // 1. Get all media files for the seance
    const mediaFiles = SeanceMedia.getBySeance(seanceId);
    
    if (!mediaFiles || mediaFiles.length === 0) {
      throw new Error('Aucun fichier média trouvé pour cette séance. Veuillez d\'abord ajouter des documents (PDF, PowerPoint, etc.) à la séance.');
    }

    console.log(`📁 ${mediaFiles.length} fichier(s) média trouvé(s)`);

    // 2. Get extraction summary
    const extractionSummary = getExtractionSummary(mediaFiles);
    console.log(`📊 Résumé d'extraction:`, extractionSummary);

    if (extractionSummary.supported === 0) {
      throw new Error('Aucun fichier supporté pour l\'extraction de contenu. Types supportés: PDF, PowerPoint, Word, Texte.');
    }

    // 3. Extract content from all supported files
    console.log('🔍 Extraction du contenu des documents...');
    const documentContent = await extractSeanceContent(mediaFiles);
    
    if (!documentContent || documentContent.trim().length < 100) {
      throw new Error('Le contenu extrait est insuffisant pour générer des questions pertinentes. Veuillez vérifier que vos documents contiennent du texte.');
    }

    console.log(`📝 Contenu extrait: ${documentContent.length} caractères`);

    // 4. Generate questions using AI
    console.log('🧠 Génération des questions avec ChatGPT-4o...');
    const questions = await generateQuestionsFromContent(documentContent, numberOfQuestions);

    if (!questions || questions.length === 0) {
      throw new Error('Aucune question n\'a pu être générée à partir du contenu.');
    }

    console.log(`✅ ${questions.length} question(s) générée(s) avec succès`);

    // 5. Return results with metadata
    return {
      success: true,
      questions: questions,
      metadata: {
        seanceId: seanceId,
        numberOfQuestions: questions.length,
        requestedQuestions: numberOfQuestions,
        extractionSummary: extractionSummary,
        contentLength: documentContent.length,
        generatedAt: new Date().toISOString()
      }
    };

  } catch (error) {
    console.error('❌ Erreur lors de la génération des questions:', error);
    
    return {
      success: false,
      error: error.message,
      metadata: {
        seanceId: seanceId,
        requestedQuestions: numberOfQuestions,
        failedAt: new Date().toISOString()
      }
    };
  }
}

/**
 * Validate seance content for question generation
 * @param {number} seanceId - ID of the seance
 * @returns {Promise<Object>} Validation results
 */
export async function validateSeanceForQuestionGeneration(seanceId) {
  try {
    const mediaFiles = SeanceMedia.getBySeance(seanceId);
    
    if (!mediaFiles || mediaFiles.length === 0) {
      return {
        valid: false,
        reason: 'Aucun fichier média trouvé',
        suggestions: ['Ajoutez des documents PDF, PowerPoint ou Word à la séance']
      };
    }

    const extractionSummary = getExtractionSummary(mediaFiles);
    
    if (extractionSummary.supported === 0) {
      return {
        valid: false,
        reason: 'Aucun fichier supporté pour l\'extraction',
        suggestions: [
          'Ajoutez des fichiers PDF, PowerPoint (.pptx), Word (.docx) ou texte',
          'Convertissez vos fichiers dans un format supporté'
        ],
        unsupportedFiles: extractionSummary.unsupportedFiles
      };
    }

    // Try to extract a small sample to check content quality
    try {
      const sampleContent = await extractSeanceContent(mediaFiles.slice(0, 1));
      
      if (sampleContent.length < 50) {
        return {
          valid: false,
          reason: 'Contenu insuffisant dans les documents',
          suggestions: [
            'Vérifiez que vos documents contiennent du texte',
            'Ajoutez plus de contenu textuel aux documents'
          ]
        };
      }
    } catch (extractionError) {
      return {
        valid: false,
        reason: 'Erreur lors de l\'extraction du contenu',
        suggestions: [
          'Vérifiez que les fichiers ne sont pas corrompus',
          'Essayez de re-télécharger les documents'
        ],
        error: extractionError.message
      };
    }

    return {
      valid: true,
      extractionSummary: extractionSummary,
      estimatedContentLength: 'Contenu détecté et extractible'
    };

  } catch (error) {
    return {
      valid: false,
      reason: 'Erreur lors de la validation',
      error: error.message
    };
  }
}

/**
 * Get question generation statistics for a seance
 * @param {number} seanceId - ID of the seance
 * @returns {Object} Statistics about potential question generation
 */
export function getQuestionGenerationStats(seanceId) {
  try {
    const mediaFiles = SeanceMedia.getBySeance(seanceId);
    const extractionSummary = getExtractionSummary(mediaFiles);
    
    return {
      totalFiles: mediaFiles.length,
      supportedFiles: extractionSummary.supported,
      unsupportedFiles: extractionSummary.unsupported,
      canGenerateQuestions: extractionSummary.supported > 0,
      supportedFileTypes: extractionSummary.supportedFiles,
      unsupportedFileTypes: extractionSummary.unsupportedFiles,
      recommendations: generateRecommendations(extractionSummary)
    };
  } catch (error) {
    return {
      error: error.message,
      canGenerateQuestions: false
    };
  }
}

/**
 * Generate recommendations based on extraction summary
 */
function generateRecommendations(extractionSummary) {
  const recommendations = [];
  
  if (extractionSummary.supported === 0) {
    recommendations.push('Ajoutez des fichiers PDF, PowerPoint ou Word pour permettre la génération de questions');
  }
  
  if (extractionSummary.unsupported > 0) {
    recommendations.push(`${extractionSummary.unsupported} fichier(s) ne peuvent pas être traités. Convertissez-les en PDF ou PowerPoint si possible`);
  }
  
  if (extractionSummary.supported > 0 && extractionSummary.supported < 3) {
    recommendations.push('Ajoutez plus de documents pour enrichir le contenu et améliorer la qualité des questions');
  }
  
  if (extractionSummary.supported >= 3) {
    recommendations.push('Excellent! Vous avez suffisamment de contenu pour générer des questions de qualité');
  }
  
  return recommendations;
}

/**
 * Preview what content would be extracted (for debugging/admin purposes)
 * @param {number} seanceId - ID of the seance
 * @param {number} maxLength - Maximum length of preview (default: 500)
 * @returns {Promise<Object>} Content preview
 */
export async function previewSeanceContent(seanceId, maxLength = 500) {
  try {
    const mediaFiles = SeanceMedia.getBySeance(seanceId);
    
    if (!mediaFiles || mediaFiles.length === 0) {
      return {
        success: false,
        message: 'Aucun fichier média trouvé'
      };
    }

    const extractionSummary = getExtractionSummary(mediaFiles);
    
    if (extractionSummary.supported === 0) {
      return {
        success: false,
        message: 'Aucun fichier supporté pour l\'extraction',
        extractionSummary
      };
    }

    const fullContent = await extractSeanceContent(mediaFiles);
    const preview = fullContent.length > maxLength 
      ? fullContent.substring(0, maxLength) + '...'
      : fullContent;

    return {
      success: true,
      preview: preview,
      fullLength: fullContent.length,
      extractionSummary: extractionSummary
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}
