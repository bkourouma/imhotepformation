import React, { useState, useEffect } from 'react';
import { X, Download, ZoomIn, ZoomOut, RotateCw, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import Button from './Button';

/**
 * MediaViewer component for displaying images and videos in a popup modal
 */
const MediaViewer = ({ 
  isOpen, 
  onClose, 
  media, 
  downloadUrl 
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [videoRef, setVideoRef] = useState(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setRotation(0);
      setIsPlaying(false);
      setIsMuted(false);
    }
  }, [isOpen]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case '+':
        case '=':
          e.preventDefault();
          setZoom(prev => Math.min(prev + 0.25, 3));
          break;
        case '-':
          e.preventDefault();
          setZoom(prev => Math.max(prev - 0.25, 0.25));
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          setRotation(prev => (prev + 90) % 360);
          break;
        case ' ':
          if (media?.file_type === 'video' && videoRef) {
            e.preventDefault();
            togglePlayPause();
          }
          break;
        case 'm':
        case 'M':
          if (media?.file_type === 'video' && videoRef) {
            e.preventDefault();
            toggleMute();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, media, videoRef, onClose]);

  const togglePlayPause = () => {
    if (videoRef) {
      if (isPlaying) {
        videoRef.pause();
      } else {
        videoRef.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef) {
      videoRef.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleDownload = () => {
    if (downloadUrl) {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = media?.original_name || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const resetView = () => {
    setZoom(1);
    setRotation(0);
  };

  if (!isOpen || !media) return null;

  const isImage = media.file_type === 'image';
  const isVideo = media.file_type === 'video';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-black bg-opacity-50 p-4">
        <div className="flex items-center justify-between text-white">
          <div>
            <h3 className="text-lg font-semibold">{media.title || media.original_name}</h3>
            {media.description && (
              <p className="text-sm text-gray-300 mt-1">{media.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Image Controls */}
            {isImage && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setZoom(prev => Math.max(prev - 0.25, 0.25))}
                  className="text-white hover:bg-white hover:bg-opacity-20"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm text-white px-2">{Math.round(zoom * 100)}%</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setZoom(prev => Math.min(prev + 0.25, 3))}
                  className="text-white hover:bg-white hover:bg-opacity-20"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setRotation(prev => (prev + 90) % 360)}
                  className="text-white hover:bg-white hover:bg-opacity-20"
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetView}
                  className="text-white hover:bg-white hover:bg-opacity-20"
                >
                  Reset
                </Button>
              </>
            )}

            {/* Video Controls */}
            {isVideo && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={togglePlayPause}
                  className="text-white hover:bg-white hover:bg-opacity-20"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                  className="text-white hover:bg-white hover:bg-opacity-20"
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
              </>
            )}

            {/* Download */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              className="text-white hover:bg-white hover:bg-opacity-20"
            >
              <Download className="h-4 w-4" />
            </Button>

            {/* Close */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Media Content */}
      <div className="flex items-center justify-center w-full h-full p-16">
        {isImage && (
          <img
            src={downloadUrl}
            alt={media.title || media.original_name}
            className="max-w-full max-h-full object-contain cursor-grab active:cursor-grabbing"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              transition: 'transform 0.2s ease-in-out'
            }}
            draggable={false}
          />
        )}

        {isVideo && (
          <video
            ref={setVideoRef}
            src={downloadUrl}
            className="max-w-full max-h-full"
            controls
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onVolumeChange={(e) => setIsMuted(e.target.muted)}
          >
            Votre navigateur ne supporte pas la lecture vidéo.
          </video>
        )}
      </div>

      {/* Footer with keyboard shortcuts */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-black bg-opacity-50 p-2">
        <div className="text-center text-xs text-gray-300">
          {isImage && (
            <span>Raccourcis: Échap (fermer) • +/- (zoom) • R (rotation) • Clic (glisser)</span>
          )}
          {isVideo && (
            <span>Raccourcis: Échap (fermer) • Espace (lecture/pause) • M (muet)</span>
          )}
        </div>
      </div>

      {/* Click outside to close */}
      <div 
        className="absolute inset-0 -z-10" 
        onClick={onClose}
      />
    </div>
  );
};

export default MediaViewer;
