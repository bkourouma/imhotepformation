import React, { useState } from 'react';
import { 
  Eye, Download, Edit, Trash2, File, Image, Video, FileText, 
  Presentation, Calendar, User, HardDrive 
} from 'lucide-react';
import Button from './Button';
import MediaViewer from './MediaViewer';
import { dateUtils } from '../../utils/helpers';

/**
 * MediaList component for displaying a list of media files
 */
const MediaList = ({ 
  media = [], 
  onEdit, 
  onDelete, 
  isAdmin = false,
  className = '' 
}) => {
  const [viewerMedia, setViewerMedia] = useState(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'image':
        return <Image className="h-5 w-5 text-blue-500" />;
      case 'video':
        return <Video className="h-5 w-5 text-purple-500" />;
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'powerpoint':
        return <Presentation className="h-5 w-5 text-orange-500" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const getFileTypeLabel = (fileType) => {
    switch (fileType) {
      case 'image':
        return 'Image';
      case 'video':
        return 'Vidéo';
      case 'pdf':
        return 'PDF';
      case 'powerpoint':
        return 'PowerPoint';
      default:
        return 'Fichier';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleView = (mediaItem) => {
    if (mediaItem.file_type === 'image' || mediaItem.file_type === 'video') {
      setViewerMedia(mediaItem);
      setIsViewerOpen(true);
    } else {
      // For PDF and PowerPoint, open in new tab
      window.open(`/api/seance-media/${mediaItem.id}/download`, '_blank');
    }
  };

  const handleDownload = (mediaItem) => {
    const link = document.createElement('a');
    link.href = `/api/seance-media/${mediaItem.id}/download`;
    link.download = mediaItem.original_name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const closeViewer = () => {
    setIsViewerOpen(false);
    setViewerMedia(null);
  };

  if (media.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <File className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Aucun média disponible</p>
      </div>
    );
  }

  return (
    <>
      <div className={`space-y-4 ${className}`}>
        {media.map((mediaItem) => (
          <div
            key={mediaItem.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-4">
              {/* File Icon */}
              <div className="flex-shrink-0 mt-1">
                {getFileIcon(mediaItem.file_type)}
              </div>

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-medium text-gray-900 truncate">
                      {mediaItem.title || mediaItem.original_name}
                    </h4>
                    {mediaItem.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {mediaItem.description}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleView(mediaItem)}
                      className="flex items-center gap-1"
                    >
                      <Eye className="h-4 w-4" />
                      {mediaItem.file_type === 'image' || mediaItem.file_type === 'video' 
                        ? 'Voir' 
                        : 'Ouvrir'
                      }
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(mediaItem)}
                      className="flex items-center gap-1"
                    >
                      <Download className="h-4 w-4" />
                      Télécharger
                    </Button>

                    {isAdmin && onEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(mediaItem)}
                        className="flex items-center gap-1"
                      >
                        <Edit className="h-4 w-4" />
                        Modifier
                      </Button>
                    )}

                    {isAdmin && onDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(mediaItem)}
                        className="flex items-center gap-1 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                        Supprimer
                      </Button>
                    )}
                  </div>
                </div>

                {/* File Metadata */}
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <File className="h-3 w-3" />
                    <span>{getFileTypeLabel(mediaItem.file_type)}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <HardDrive className="h-3 w-3" />
                    <span>{formatFileSize(mediaItem.file_size)}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{dateUtils.format(mediaItem.created_at)}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {mediaItem.original_name}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Media Viewer Modal */}
      <MediaViewer
        isOpen={isViewerOpen}
        onClose={closeViewer}
        media={viewerMedia}
        downloadUrl={viewerMedia ? `/api/seance-media/${viewerMedia.id}/download` : null}
      />
    </>
  );
};

export default MediaList;
