import React, { useState } from 'react';
import { Trash2, Download, Eye, Calendar, Tag, FileImage } from 'lucide-react';
import type { Image } from '../types';
import ImageModal from './ImageModal';

interface ImageGalleryProps {
  images: Image[];
  loading: boolean;
  viewMode: 'grid' | 'list';
  onImageDeleted: () => void;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ 
  images, 
  loading, 
  viewMode, 
  onImageDeleted 
}) => {
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);

  const handleDelete = async (imageId: string) => {
    if (confirm('Are you sure you want to delete this image?')) {
      try {
        const response = await fetch(`http://localhost:3001/api/images/${imageId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          onImageDeleted();
        }
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="text-center py-12">
        <FileImage className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No images found
        </h3>
        <p className="text-gray-500">
          Upload some images to get started with your visual collection.
        </p>
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <>
        <div className="space-y-4">
          {images.map((image) => (
            <div key={image.id} className="card p-4">
              <div className="flex items-center space-x-4">
                <img
                  src={`http://localhost:3001/uploads/${image.filename}`}
                  alt={image.originalName}
                  className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-75 transition-opacity"
                  onClick={() => setSelectedImage(image)}
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                    {image.originalName}
                  </h4>
                  {image.description && (
                    <p className="text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                      {image.description}
                    </p>
                  )}
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(image.uploadedAt)}</span>
                    </span>
                    <span>{image.width} × {image.height}</span>
                    <span>{formatFileSize(image.size)}</span>
                  </div>
                  {image.tags && image.tags.length > 0 && (
                    <div className="flex items-center space-x-1 mt-2">
                      <Tag className="h-4 w-4 text-gray-400" />
                      <div className="flex flex-wrap gap-1">
                        {image.tags.map(tag => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedImage(image)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="View image"
                  >
                    <Eye className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </button>
                  <a
                    href={`http://localhost:3001/uploads/${image.filename}`}
                    download={image.originalName}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="Download image"
                  >
                    <Download className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </a>
                  <button
                    onClick={() => handleDelete(image.id)}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Delete image"
                  >
                    <Trash2 className="h-5 w-5 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {selectedImage && (
          <ImageModal
            image={selectedImage}
            onClose={() => setSelectedImage(null)}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="image-grid">
        {images.map((image) => (
          <div key={image.id} className="card group">
            <div className="relative aspect-square">
              <img
                src={`http://localhost:3001/uploads/${image.filename}`}
                alt={image.originalName}
                className="w-full h-full object-cover cursor-pointer transition-transform group-hover:scale-105"
                onClick={() => setSelectedImage(image)}
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedImage(image)}
                    className="p-2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-lg transition-all"
                    title="View image"
                  >
                    <Eye className="h-5 w-5 text-gray-800" />
                  </button>
                  <a
                    href={`http://localhost:3001/uploads/${image.filename}`}
                    download={image.originalName}
                    className="p-2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-lg transition-all"
                    title="Download image"
                  >
                    <Download className="h-5 w-5 text-gray-800" />
                  </a>
                  <button
                    onClick={() => handleDelete(image.id)}
                    className="p-2 bg-red-500 bg-opacity-90 hover:bg-opacity-100 rounded-lg transition-all"
                    title="Delete image"
                  >
                    <Trash2 className="h-5 w-5 text-white" />
                  </button>
                </div>
              </div>
            </div>
            <div className="p-4">
              <h4 className="font-medium text-gray-900 dark:text-white truncate">
                {image.originalName}
              </h4>
              {image.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                  {image.description}
                </p>
              )}
              <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                <span>{formatDate(image.uploadedAt)}</span>
                <span>{image.width} × {image.height}</span>
              </div>
              {image.tags && image.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {image.tags.slice(0, 2).map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                  {image.tags.length > 2 && (
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs">
                      +{image.tags.length - 2}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {selectedImage && (
        <ImageModal
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </>
  );
};

export default ImageGallery;