import type React from 'react';
import { useState } from 'react';

interface ImageSliderProps {
  images: {
    url: string;
    alt: string;
  }[];
  productName: string;
}

const ImageSlider: React.FC<ImageSliderProps> = ({ images, productName }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
        <span className="text-gray-400">No image available</span>
      </div>
    );
  }

  const handlePrevious = () => {
    setActiveIndex((current) => (current === 0 ? images.length - 1 : current - 1));
  };

  const handleNext = () => {
    setActiveIndex((current) => (current === images.length - 1 ? 0 : current + 1));
  };

  const handleThumbnailClick = (index: number) => {
    setActiveIndex(index);
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  return (
    <>
      {/* Main Slider */}
      <div className="relative w-full">
        <div className="relative aspect-square bg-white border border-gray-200 rounded-lg overflow-hidden">
          <img
            src={images[activeIndex].url}
            alt={images[activeIndex].alt || productName}
            className="w-full h-full object-contain"
            loading="lazy"
          />

          {/* Navigation Arrows */}
          <button
            onClick={handlePrevious}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-75 hover:bg-opacity-100 rounded-full p-2 shadow-md focus:outline-none focus:ring-2 focus:ring-[#982a4a] text-gray-800"
            aria-label="Previous image"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>

          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-75 hover:bg-opacity-100 rounded-full p-2 shadow-md focus:outline-none focus:ring-2 focus:ring-[#982a4a] text-gray-800"
            aria-label="Next image"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>

          {/* Zoom/Fullscreen Button */}
          <button
            onClick={toggleFullScreen}
            className="absolute top-2 right-2 bg-white bg-opacity-75 hover:bg-opacity-100 rounded-full p-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#982a4a] text-gray-800"
            aria-label="View full screen"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M3 8V4m0 0h4M3 4l4 4m-4 4v4m0 0h4m-4 0l4-4m8-4V4m0 0h-4m4 0l-4 4m4 8v-4m0 4h-4m4 0l-4-4" />
            </svg>
          </button>

          {/* Image Counter */}
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full">
            {activeIndex + 1} / {images.length}
          </div>
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="mt-4">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => handleThumbnailClick(index)}
                className={`relative w-16 h-16 flex-shrink-0 border-2 rounded overflow-hidden focus:outline-none ${
                  activeIndex === index ? 'border-[#982a4a]' : 'border-gray-200 hover:border-gray-300'
                }`}
                aria-label={`View image ${index + 1}`}
                aria-pressed={activeIndex === index}
              >
                <img
                  src={image.url}
                  alt={image.alt || `${productName} thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Fullscreen Modal */}
      {isFullScreen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl mx-auto">
            <button
              onClick={toggleFullScreen}
              className="absolute top-2 right-2 z-10 bg-black bg-opacity-50 hover:bg-opacity-75 text-white rounded-full p-2 focus:outline-none"
              aria-label="Close fullscreen view"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="relative">
              <img
                src={images[activeIndex].url}
                alt={images[activeIndex].alt || productName}
                className="max-h-[80vh] max-w-full mx-auto"
              />

              <button
                onClick={handlePrevious}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white rounded-full p-3 focus:outline-none"
                aria-label="Previous image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white rounded-full p-3 focus:outline-none"
                aria-label="Next image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Fullscreen Thumbnails */}
            <div className="mt-4 flex justify-center">
              <div className="flex space-x-2 overflow-x-auto">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => handleThumbnailClick(index)}
                    className={`relative w-16 h-16 flex-shrink-0 border-2 rounded overflow-hidden focus:outline-none ${
                      activeIndex === index ? 'border-white' : 'border-gray-700 hover:border-gray-500'
                    }`}
                    aria-label={`View image ${index + 1}`}
                    aria-pressed={activeIndex === index}
                  >
                    <img
                      src={image.url}
                      alt={image.alt || `${productName} thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ImageSlider;
