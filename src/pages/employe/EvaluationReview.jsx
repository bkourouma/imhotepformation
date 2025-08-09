import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Target,
  BookOpen,
  AlertCircle,
  Eye
} from 'lucide-react';
import Button from '../../components/shared/Button';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/shared/Card';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorMessage from '../../components/shared/ErrorMessage';
import { useEmployeAuth } from '../../hooks/useEmployeAuth.jsx';
import { employeApi } from '../../services/employeApi.js';

export default function EvaluationReview() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const { employe } = useEmployeAuth();
  const [attemptDetails, setAttemptDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAttemptDetails = async () => {
      try {
        setLoading(true);
        setError('');

        const details = await employeApi.getEvaluationAttemptDetails(employe.id, attemptId);
        setAttemptDetails(details);
      } catch (err) {
        setError(err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (employe && attemptId) {
      fetchAttemptDetails();
    }
  }, [employe, attemptId]);

  const handleBack = () => {
    navigate('/employe/dashboard');
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getQuestionIcon = (isCorrect) => {
    return isCorrect ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    );
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const renderQuestionAnswer = (question) => {
    const { user_answer, correct_answers, options, type, is_correct } = question;

    switch (type) {
      case 'multiple_choice':
        return (
          <div className="space-y-2">
            {options.map((option, index) => {
              const isUserChoice = user_answer === option;
              const isCorrectChoice = correct_answers.includes(option);
              
              let className = "p-3 rounded-lg border ";
              if (isUserChoice && isCorrectChoice) {
                className += "bg-green-50 border-green-200 text-green-800";
              } else if (isUserChoice && !isCorrectChoice) {
                className += "bg-red-50 border-red-200 text-red-800";
              } else if (isCorrectChoice) {
                className += "bg-green-50 border-green-200 text-green-600";
              } else {
                className += "bg-gray-50 border-gray-200 text-gray-600";
              }

              return (
                <div key={index} className={className}>
                  <div className="flex items-center justify-between">
                    <span>{option}</span>
                    <div className="flex items-center gap-2">
                      {isUserChoice && (
                        <span className="text-xs font-medium">Votre réponse</span>
                      )}
                      {isCorrectChoice && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );

      case 'multiple_choice_multiple':
        return (
          <div className="space-y-2">
            {options.map((option, index) => {
              const isUserChoice = Array.isArray(user_answer) && user_answer.includes(option);
              const isCorrectChoice = correct_answers.includes(option);
              
              let className = "p-3 rounded-lg border ";
              if (isUserChoice && isCorrectChoice) {
                className += "bg-green-50 border-green-200 text-green-800";
              } else if (isUserChoice && !isCorrectChoice) {
                className += "bg-red-50 border-red-200 text-red-800";
              } else if (isCorrectChoice) {
                className += "bg-green-50 border-green-200 text-green-600";
              } else {
                className += "bg-gray-50 border-gray-200 text-gray-600";
              }

              return (
                <div key={index} className={className}>
                  <div className="flex items-center justify-between">
                    <span>{option}</span>
                    <div className="flex items-center gap-2">
                      {isUserChoice && (
                        <span className="text-xs font-medium">Sélectionné</span>
                      )}
                      {isCorrectChoice && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );

      case 'text':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Votre réponse:
              </label>
              <div className="p-3 bg-gray-50 rounded-lg border">
                <p className="text-gray-800">
                  {user_answer || "Aucune réponse fournie"}
                </p>
              </div>
            </div>
            {!is_correct && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-yellow-800">
                      Cette question nécessite une évaluation manuelle par l'instructeur.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return <p className="text-gray-500">Type de question non supporté</p>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Chargement des détails..." />
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

  if (!attemptDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent>
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Détails de l'évaluation non trouvés</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { attempt, questions, summary } = attemptDetails;

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
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Révision de l'évaluation
                </h1>
                <p className="text-gray-600">
                  {attempt.evaluation_titre}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Eye className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Mode révision</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Résumé de votre performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getScoreColor(summary.pourcentage)}`}>
                    {summary.pourcentage.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-500">Score final</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {summary.correct_answers}/{summary.total_questions}
                  </div>
                  <div className="text-sm text-gray-500">Bonnes réponses</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {summary.score}
                  </div>
                  <div className="text-sm text-gray-500">Points obtenus</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {formatTime(summary.temps_utilise)}
                  </div>
                  <div className="text-sm text-gray-500">Temps utilisé</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Questions Review */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Révision des questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {questions.map((question, index) => (
                  <div key={question.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                    {/* Question Header */}
                    <div className="flex items-start gap-3 mb-4">
                      <div className="flex-shrink-0 mt-1">
                        {getQuestionIcon(question.is_correct)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-medium text-gray-900">
                            Question {index + 1}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium ${
                              question.is_correct ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {question.is_correct ? 'Correct' : 'Incorrect'}
                            </span>
                            <span className="text-sm text-gray-500">
                              {question.points} point{question.points > 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-700 mb-4">
                          {question.question}
                        </p>
                      </div>
                    </div>

                    {/* Question Type Badge */}
                    <div className="mb-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {question.type === 'multiple_choice' && 'Choix unique'}
                        {question.type === 'multiple_choice_multiple' && 'Choix multiples'}
                        {question.type === 'text' && 'Réponse libre'}
                      </span>
                    </div>

                    {/* Answer Section */}
                    <div>
                      {renderQuestionAnswer(question)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour au tableau de bord
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
