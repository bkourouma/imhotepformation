import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle, XCircle, Send, AlertCircle, Eye } from 'lucide-react';
import Button from '../../components/shared/Button';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/shared/Card';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorMessage from '../../components/shared/ErrorMessage';
import { useEmployeAuth } from '../../hooks/useEmployeAuth.jsx';
import { employeApi } from '../../services/employeApi.js';

export default function TakeEvaluation() {
  const { seanceId, evaluationId } = useParams();
  const navigate = useNavigate();
  const { employe } = useEmployeAuth();
  const [evaluation, setEvaluation] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    const fetchEvaluation = async () => {
      try {
        setLoading(true);
        setError('');

        const evaluationData = await employeApi.getEvaluationDetails(evaluationId);
        setEvaluation(evaluationData);
        setTimeLeft(evaluationData.duree_minutes * 60); // Convert to seconds
      } catch (err) {
        setError(err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (employe && evaluationId) {
      fetchEvaluation();
    }
  }, [employe, evaluationId]);

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !showResults) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeLeft, showResults]);

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleMultipleChoiceChange = (questionId, option, checked) => {
    setAnswers(prev => {
      const currentAnswers = prev[questionId] || [];
      if (checked) {
        return {
          ...prev,
          [questionId]: [...currentAnswers, option]
        };
      } else {
        return {
          ...prev,
          [questionId]: currentAnswers.filter(ans => ans !== option)
        };
      }
    });
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError('');

      const timeUsed = evaluation.duree_minutes * 60 - timeLeft;
      
      const result = await employeApi.submitEvaluation(evaluationId, {
        employe_id: employe.id,
        reponses: answers,
        temps_utilise: timeUsed
      });

      setResults(result);
      setShowResults(true);
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate(`/employe/evaluations/${seanceId}`);
  };

  const handleRetake = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setTimeLeft(evaluation.duree_minutes * 60);
    setShowResults(false);
    setResults(null);
  };

  const handleViewDetails = () => {
    if (results && results.attempt_id) {
      navigate(`/employe/evaluations/review/${results.attempt_id}`);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getQuestionComponent = (question) => {
    switch (question.type) {
      case 'multiple_choice':
        return (
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <label key={index} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option}
                  checked={answers[question.id] === option}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'multiple_choice_multiple':
        return (
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <label key={index} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  value={option}
                  checked={(answers[question.id] || []).includes(option)}
                  onChange={(e) => handleMultipleChoiceChange(question.id, option, e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'text':
        return (
          <textarea
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
            placeholder="Tapez votre réponse ici..."
          />
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Chargement..." />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage 
        error={error} 
        onDismiss={() => setError('')}
        title="Erreur lors du chargement"
      />
    );
  }

  if (!evaluation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Évaluation non trouvée</p>
        </div>
      </div>
    );
  }

  if (showResults && results) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBack}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour
                </Button>
                <h1 className="text-2xl font-bold text-gray-900">
                  Résultats de l'évaluation
                </h1>
              </div>
            </div>
          </div>
        </header>

        {/* Results */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent>
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  {results.pourcentage >= 70 ? (
                    <CheckCircle className="h-16 w-16 text-green-500" />
                  ) : (
                    <XCircle className="h-16 w-16 text-red-500" />
                  )}
                </div>
                
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {results.pourcentage >= 70 ? 'Félicitations !' : 'Continuez vos efforts !'}
                  </h2>
                  <p className="text-gray-600">
                    Vous avez obtenu {results.pourcentage.toFixed(1)}% de bonnes réponses
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{results.score}</div>
                    <div className="text-sm text-gray-500">Points obtenus</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-600">{results.total_points}</div>
                    <div className="text-sm text-gray-500">Points totaux</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{formatTime(results.temps_utilise)}</div>
                    <div className="text-sm text-gray-500">Temps utilisé</div>
                  </div>
                </div>

                <div className="flex justify-center space-x-4">
                  <Button onClick={handleBack} variant="outline">
                    Retour aux évaluations
                  </Button>
                  <Button
                    onClick={handleViewDetails}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Voir les détails
                  </Button>
                  <Button onClick={handleRetake}>
                    Recommencer
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const currentQuestionData = evaluation.questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBack}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">
                {evaluation.titre}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-red-600">
                <Clock className="h-5 w-5" />
                <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-600">
              Question {currentQuestion + 1} sur {evaluation.questions.length}
            </span>
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / evaluation.questions.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Question */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {currentQuestionData.question}
                </h2>
                {getQuestionComponent(currentQuestionData)}
              </div>

              <div className="flex justify-between pt-6">
                <Button
                  variant="outline"
                  onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                  disabled={currentQuestion === 0}
                >
                  Précédent
                </Button>

                <div className="flex space-x-4">
                  {currentQuestion < evaluation.questions.length - 1 ? (
                    <Button
                      onClick={() => setCurrentQuestion(prev => prev + 1)}
                    >
                      Suivant
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      disabled={submitting}
                    >
                      {submitting ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      Terminer l'évaluation
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
