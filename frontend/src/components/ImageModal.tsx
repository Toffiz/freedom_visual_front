import React from 'react';
import { X, Download, Calendar, Tag, FileImage } from 'lucide-react';
import type { Image } from '../types';

interface ImageModalProps {
  image: Image;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ image, onClose }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="relative max-w-4xl max-h-screen w-full h-full flex flex-col lg:flex-row bg-white dark:bg-gray-900 animate-slide-up overflow-hidden">
        {/* Image Section */}
        <div className="flex-1 flex items-center justify-center bg-gray-100 dark:bg-gray-800 p-4">
          <img
            src={`http://localhost:3001/uploads/${image.filename}`}
            alt={image.originalName}
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        </div>

        {/* Info Panel */}
        <div className="lg:w-96 flex flex-col bg-white dark:bg-gray-900 p-6 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate pr-4">
              {image.originalName}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2 mb-6">
            <a
              href={`http://localhost:3001/uploads/${image.filename}`}
              download={image.originalName}
              className="btn-primary flex items-center space-x-2 flex-1 justify-center"
            >
              <Download className="h-4 w-4" />
              <span>Download</span>
            </a>
          </div>

          {/* Description */}
          {image.description && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </h3>
              <p className="text-gray-900 dark:text-white text-sm leading-relaxed">
                {image.description}
              </p>
            </div>
          )}

          {/* Tags */}
          {image.tags && image.tags.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center space-x-1">
                <Tag className="h-4 w-4" />
                <span>Tags</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {image.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Image Details */}
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center space-x-1">
                <FileImage className="h-4 w-4" />
                <span>Details</span>
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Dimensions:</span>
                  <span className="text-gray-900 dark:text-white">
                    {image.width} × {image.height} px
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">File size:</span>
                  <span className="text-gray-900 dark:text-white">
                    {formatFileSize(image.size)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Format:</span>
                  <span className="text-gray-900 dark:text-white">
                    {image.mimeType.replace('image/', '').toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>Uploaded:</span>
                  </span>
                  <span className="text-gray-900 dark:text-white text-right">
                    {formatDate(image.uploadedAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;