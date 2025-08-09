import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Download, Eye, Calendar, MapPin, BookOpen } from 'lucide-react';
import Button from '../../components/shared/Button';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/shared/Card';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorMessage from '../../components/shared/ErrorMessage';
import { useEmployeAuth } from '../../hooks/useEmployeAuth.jsx';
import { employeApi } from '../../services/employeApi.js';

export default function SeanceMedia() {
  const { seanceId } = useParams();
  const navigate = useNavigate();
  const { employe } = useEmployeAuth();
  const [media, setMedia] = useState([]);
  const [seance, setSeance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        const [mediaData, seanceData] = await Promise.all([
          employeApi.getSeanceMedia(seanceId),
          fetch(`/api/seances/${seanceId}`).then(res => res.json())
        ]);

        setMedia(mediaData);
        setSeance(seanceData);
      } catch (err) {
        setError(err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (seanceId) {
      fetchData();
    }
  }, [seanceId]);

  const handleMediaClick = async (mediaItem) => {
    try {
      // Record access
      await employeApi.recordMediaAccess(mediaItem.id, employe.id);
      
      // Open media in new tab
      window.open(`/api/seance-media/${mediaItem.id}/download`, '_blank');
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de l\'accès:', error);
      // Still open the media even if recording fails
      window.open(`/api/seance-media/${mediaItem.id}/download`, '_blank');
    }
  };

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'pdf':
        return '📄';
      case 'powerpoint':
        return '📊';
      case 'image':
        return '🖼️';
      case 'video':
        return '🎥';
      default:
        return '📁';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/employe/dashboard')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">
                Media de la séance
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Seance Info */}
          {seance && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                  {seance.formation_nom}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {seance.description}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {seance.formation_objectifs}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>
                        {new Date(seance.date_debut).toLocaleDateString('fr-FR')} - {new Date(seance.date_fin).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{seance.lieu}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FileText className="h-4 w-4 mr-2" />
                      <span>{media.length} fichier(s) disponible(s)</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Media List */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Fichiers de formation
            </h3>
            
            {media.length === 0 ? (
              <Card>
                <CardContent>
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      Aucun fichier disponible pour cette séance
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {media.map((mediaItem) => (
                  <Card 
                    key={mediaItem.id} 
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => handleMediaClick(mediaItem)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="text-2xl">
                          {getFileIcon(mediaItem.file_type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">
                            {mediaItem.title || mediaItem.original_name}
                          </h4>
                          <p className="text-sm text-gray-500 mt-1">
                            {mediaItem.file_type.toUpperCase()} • {formatFileSize(mediaItem.file_size)}
                          </p>
                          {mediaItem.description && (
                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                              {mediaItem.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMediaClick(mediaItem);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(`/api/seance-media/${mediaItem.id}/download`, '_blank');
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
