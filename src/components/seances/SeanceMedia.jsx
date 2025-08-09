import React, { useState, useEffect } from 'react';
import { Plus, Filter, Grid, List } from 'lucide-react';
import Button from '../shared/Button';
import Card from '../shared/Card';
import MediaList from '../shared/MediaList';
import MediaUpload from '../shared/MediaUpload';
import LoadingSpinner from '../shared/LoadingSpinner';
import ErrorMessage from '../shared/ErrorMessage';
import { seanceMediaService } from '../../services/api';
import { useAdminAuth } from '../../hooks/useAdminAuth';

/**
 * SeanceMedia component for managing media files for a specific seance
 */
const SeanceMedia = ({ seanceId, seance }) => {
  const { isAuthenticated: isAdmin } = useAdminAuth();
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState('list');
  const [editingMedia, setEditingMedia] = useState(null);

  useEffect(() => {
    if (seanceId) {
      loadMedia();
    }
  }, [seanceId]);

  const loadMedia = async () => {
    try {
      setLoading(true);
      const response = await seanceMediaService.getBySeance(seanceId);
      setMedia(response || []);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des médias');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file, metadata) => {
    try {
      setUploading(true);
      const response = await seanceMediaService.upload(seanceId, file, metadata);
      setMedia(prev => [response, ...prev]);
      setShowUpload(false);
      setError(null);
    } catch (err) {
      setError('Erreur lors de l\'upload du fichier');
      console.error('Erreur:', err);
      throw err; // Re-throw to let MediaUpload handle it
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (mediaItem) => {
    setEditingMedia(mediaItem);
    // TODO: Implement edit modal
  };

  const handleDelete = async (mediaItem) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer "${mediaItem.title}" ?`)) {
      return;
    }

    try {
      await seanceMediaService.delete(mediaItem.id);
      setMedia(prev => prev.filter(m => m.id !== mediaItem.id));
    } catch (err) {
      setError('Erreur lors de la suppression du média');
      console.error('Erreur:', err);
    }
  };

  const filteredMedia = media.filter(mediaItem => {
    if (filter === 'all') return true;
    return mediaItem.file_type === filter;
  });

  const getFilterCounts = () => {
    const counts = {
      all: media.length,
      image: media.filter(m => m.file_type === 'image').length,
      video: media.filter(m => m.file_type === 'video').length,
      pdf: media.filter(m => m.file_type === 'pdf').length,
      powerpoint: media.filter(m => m.file_type === 'powerpoint').length,
    };
    return counts;
  };

  const filterOptions = [
    { value: 'all', label: 'Tous', count: getFilterCounts().all },
    { value: 'image', label: 'Images', count: getFilterCounts().image },
    { value: 'video', label: 'Vidéos', count: getFilterCounts().video },
    { value: 'pdf', label: 'PDF', count: getFilterCounts().pdf },
    { value: 'powerpoint', label: 'PowerPoint', count: getFilterCounts().powerpoint },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Médias de la séance</h3>
          <p className="text-sm text-gray-600 mt-1">
            {seance?.description || 'Séance'} - {media.length} fichier(s)
          </p>
        </div>
        
        {isAdmin && (
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
            >
              {viewMode === 'list' ? <Grid className="h-4 w-4" /> : <List className="h-4 w-4" />}
            </Button>
            
            <Button
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Ajouter un média
            </Button>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <ErrorMessage 
          message={error} 
          onDismiss={() => setError(null)}
        />
      )}

      {/* Upload Component */}
      {showUpload && isAdmin && (
        <Card>
          <MediaUpload
            onUpload={handleUpload}
            onCancel={() => setShowUpload(false)}
            isUploading={uploading}
          />
        </Card>
      )}

      {/* Filters */}
      {media.length > 0 && (
        <Card>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filtrer par type:</span>
            <div className="flex gap-2">
              {filterOptions.map(option => (
                <Button
                  key={option.value}
                  variant={filter === option.value ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(option.value)}
                  className="flex items-center gap-1"
                >
                  {option.label}
                  {option.count > 0 && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
                      {option.count}
                    </span>
                  )}
                </Button>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Media List */}
      <Card>
        <MediaList
          media={filteredMedia}
          onEdit={isAdmin ? handleEdit : null}
          onDelete={isAdmin ? handleDelete : null}
          isAdmin={isAdmin}
        />
      </Card>

      {/* Empty State */}
      {media.length === 0 && !showUpload && (
        <Card>
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun média</h3>
            <p className="text-gray-600 mb-6">
              Cette séance n'a pas encore de médias associés.
            </p>
            {isAdmin && (
              <Button
                onClick={() => setShowUpload(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Ajouter le premier média
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default SeanceMedia;
