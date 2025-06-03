'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { X, RotateCw, ZoomIn, ZoomOut, Move, Check } from 'lucide-react';

const ImageCropper = ({ imageFile, onCrop, onCancel, isOpen }) => {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  
  const [image, setImage] = useState(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(false);

  // Load image when file changes
  useEffect(() => {
    if (imageFile && isOpen) {
      const img = new Image();
      img.onload = () => {
        setImage(img);
        // Reset all transformations
        setScale(1);
        setPosition({ x: 0, y: 0 });
        setRotation(0);
        // Auto-fit image to container
        setTimeout(() => autoFit(img), 100);
      };
      img.src = URL.createObjectURL(imageFile);
      
      return () => {
        URL.revokeObjectURL(img.src);
      };
    }
  }, [imageFile, isOpen]);

  // Auto-fit image to the circular container
  const autoFit = (img) => {
    if (!img || !containerRef.current) return;
    
    const containerSize = 300; // Size of the preview circle
    const imageAspectRatio = img.width / img.height;
    
    let newScale;
    if (imageAspectRatio > 1) {
      // Landscape image - fit to height
      newScale = containerSize / img.height;
    } else {
      // Portrait or square image - fit to width
      newScale = containerSize / img.width;
    }
    
    setScale(newScale);
    setPosition({ x: 0, y: 0 });
  };

  // Draw image on canvas
  const drawImage = useCallback(() => {
    if (!image || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const size = 300;
    
    // Clear canvas
    ctx.clearRect(0, 0, size, size);
    
    // Save context
    ctx.save();
    
    // Move to center and apply transformations
    ctx.translate(size / 2 + position.x, size / 2 + position.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);
    
    // Draw image centered
    ctx.drawImage(
      image,
      -image.width / 2,
      -image.height / 2,
      image.width,
      image.height
    );
    
    // Restore context
    ctx.restore();
  }, [image, scale, position, rotation]);

  // Redraw when values change
  useEffect(() => {
    drawImage();
  }, [drawImage]);

  // Mouse event handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add global mouse events
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  // Crop and return the final image
  const handleCrop = async () => {
    if (!image || !canvasRef.current) return;
    
    setLoading(true);
    
    try {
      // Create final crop canvas
      const finalCanvas = document.createElement('canvas');
      const finalCtx = finalCanvas.getContext('2d');
      const outputSize = 200; // Final image size
      
      finalCanvas.width = outputSize;
      finalCanvas.height = outputSize;
      
      // Create circular clipping path
      finalCtx.beginPath();
      finalCtx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2);
      finalCtx.clip();
      
      // Draw image with transformations
      finalCtx.save();
      finalCtx.translate(outputSize / 2 + position.x * (outputSize / 300), outputSize / 2 + position.y * (outputSize / 300));
      finalCtx.rotate((rotation * Math.PI) / 180);
      finalCtx.scale(scale * (outputSize / 300), scale * (outputSize / 300));
      
      finalCtx.drawImage(
        image,
        -image.width / 2,
        -image.height / 2,
        image.width,
        image.height
      );
      
      finalCtx.restore();
      
      // Convert to blob
      finalCanvas.toBlob((blob) => {
        if (blob) {
          // Create a new File object with the cropped image
          const croppedFile = new File([blob], 'profile-picture.png', {
            type: 'image/png'
          });
          onCrop(croppedFile);
        }
        setLoading(false);
      }, 'image/png', 0.9);
      
    } catch (error) {
      console.error('Error cropping image:', error);
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-lg w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Crop Profile Picture</h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image Preview */}
        <div className="mb-6">
          <div 
            ref={containerRef}
            className="relative mx-auto bg-gray-700 rounded-full overflow-hidden border-4 border-gray-600"
            style={{ width: 300, height: 300 }}
          >
            <canvas
              ref={canvasRef}
              width={300}
              height={300}
              className="cursor-move"
              onMouseDown={handleMouseDown}
              style={{ display: image ? 'block' : 'none' }}
            />
            {!image && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                Loading image...
              </div>
            )}
          </div>
          <p className="text-center text-sm text-gray-400 mt-2">
            <Move className="w-4 h-4 inline mr-1" />
            Drag to reposition
          </p>
        </div>

        {/* Controls */}
        <div className="space-y-4 mb-6">
          {/* Zoom Control */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <ZoomIn className="w-4 h-4 inline mr-1" />
              Zoom: {Math.round(scale * 100)}%
            </label>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setScale(Math.max(0.1, scale - 0.1))}
                className="p-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <input
                type="range"
                min="0.1"
                max="3"
                step="0.1"
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="flex-1 bg-gray-700 rounded-lg appearance-none h-2 cursor-pointer"
              />
              <button
                onClick={() => setScale(Math.min(3, scale + 0.1))}
                className="p-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Rotation Control */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <RotateCw className="w-4 h-4 inline mr-1" />
              Rotation: {rotation}°
            </label>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setRotation((rotation - 90) % 360)}
                className="p-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
              >
                <RotateCw className="w-4 h-4 transform rotate-180" />
              </button>
              <input
                type="range"
                min="0"
                max="360"
                step="1"
                value={rotation}
                onChange={(e) => setRotation(parseInt(e.target.value))}
                className="flex-1 bg-gray-700 rounded-lg appearance-none h-2 cursor-pointer"
              />
              <button
                onClick={() => setRotation((rotation + 90) % 360)}
                className="p-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => autoFit(image)}
              className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
            >
              Auto Fit
            </button>
            <button
              onClick={() => setScale(1.5)}
              className="px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-sm"
            >
              Close Up
            </button>
            <button
              onClick={() => setScale(0.8)}
              className="px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors text-sm"
            >
              Wide View
            </button>
            <button
              onClick={() => {
                setScale(1);
                setPosition({ x: 0, y: 0 });
                setRotation(0);
              }}
              className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCrop}
            disabled={loading || !image}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white px-4 py-2 rounded-lg transition-colors"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Apply</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;
