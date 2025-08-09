import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Validate API key on startup
if (!process.env.OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY is not set in environment variables');
  console.error('Please add your OpenAI API key to the .env file');
} else {
  console.log('✅ OpenAI API key loaded successfully');
}

/**
 * Generate evaluation questions from document content using ChatGPT-4o
 * @param {string} documentContent - Extracted text content from documents
 * @param {number} numberOfQuestions - Number of questions to generate (default: 20)
 * @param {string} language - Language for questions (default: 'fr')
 * @returns {Promise<Array>} Array of generated questions
 */
export async function generateQuestionsFromContent(documentContent, numberOfQuestions = 20, language = 'fr') {
  try {
    if (!documentContent || documentContent.trim().length === 0) {
      throw new Error('Le contenu du document est vide ou invalide');
    }

    const prompt = createQuestionGenerationPrompt(documentContent, numberOfQuestions, language);
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Vous êtes un expert en création d'évaluations pédagogiques. Vous créez des questions pertinentes et variées basées sur le contenu fourni."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: "json_object" }
    });

    const response = completion.choices[0].message.content;
    const parsedResponse = JSON.parse(response);
    
    if (!parsedResponse.questions || !Array.isArray(parsedResponse.questions)) {
      throw new Error('Format de réponse invalide de l\'API OpenAI');
    }

    // Validate and format questions
    const formattedQuestions = parsedResponse.questions.map((q, index) => {
      return validateAndFormatQuestion(q, index + 1);
    });

    return formattedQuestions.slice(0, numberOfQuestions);
    
  } catch (error) {
    console.error('Erreur lors de la génération des questions:', error);
    throw new Error(`Erreur lors de la génération des questions: ${error.message}`);
  }
}

/**
 * Create the prompt for question generation
 */
function createQuestionGenerationPrompt(content, numberOfQuestions, language) {
  return `
Basé sur le contenu suivant, générez exactement ${numberOfQuestions} questions d'évaluation en français.

CONTENU DU DOCUMENT:
${content}

INSTRUCTIONS:
1. Créez des questions variées qui testent la compréhension du contenu
2. Utilisez 3 types de questions:
   - Questions à choix unique (60% des questions)
   - Questions à choix multiples (30% des questions) 
   - Questions ouvertes (10% des questions)
3. Les questions doivent être pertinentes et basées uniquement sur le contenu fourni
4. Pour les QCM, proposez 4 options avec une seule bonne réponse
5. Pour les questions à choix multiples, proposez 5-6 options avec 2-3 bonnes réponses
6. Assurez-vous que les questions couvrent différents aspects du contenu

FORMAT DE RÉPONSE (JSON):
{
  "questions": [
    {
      "question": "Texte de la question",
      "type": "multiple_choice", // ou "multiple_choice_multiple" ou "text"
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"], // vide pour type "text"
      "correct_answers": ["Option correcte"], // ou ["Option 1", "Option 2"] pour choix multiples, vide pour "text"
      "points": 1,
      "explanation": "Explication de la réponse (optionnel)"
    }
  ]
}

Générez maintenant les ${numberOfQuestions} questions:`;
}

/**
 * Validate and format a single question
 */
function validateAndFormatQuestion(question, questionNumber) {
  // Validate required fields
  if (!question.question || typeof question.question !== 'string') {
    throw new Error(`Question ${questionNumber}: Texte de question manquant ou invalide`);
  }

  if (!question.type || !['multiple_choice', 'multiple_choice_multiple', 'text'].includes(question.type)) {
    throw new Error(`Question ${questionNumber}: Type de question invalide`);
  }

  // Validate options for multiple choice questions
  if (question.type.includes('multiple_choice')) {
    if (!Array.isArray(question.options) || question.options.length < 2) {
      throw new Error(`Question ${questionNumber}: Options manquantes ou insuffisantes`);
    }

    if (!Array.isArray(question.correct_answers) || question.correct_answers.length === 0) {
      throw new Error(`Question ${questionNumber}: Réponses correctes manquantes`);
    }

    // Validate that correct answers exist in options
    const invalidAnswers = question.correct_answers.filter(answer => 
      !question.options.includes(answer)
    );
    
    if (invalidAnswers.length > 0) {
      throw new Error(`Question ${questionNumber}: Réponses correctes non trouvées dans les options`);
    }
  }

  // Format the question
  return {
    question: question.question.trim(),
    type: question.type,
    options: question.options || [],
    correct_answers: question.correct_answers || [],
    points: question.points || 1,
    explanation: question.explanation || ''
  };
}

/**
 * Test the OpenAI connection
 */
export async function testOpenAIConnection() {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: "Répondez simplement 'OK' pour tester la connexion."
        }
      ],
      max_tokens: 10
    });

    return {
      success: true,
      response: completion.choices[0].message.content
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}
