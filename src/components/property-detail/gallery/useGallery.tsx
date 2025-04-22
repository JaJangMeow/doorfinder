
import { useState, useCallback, useRef, useEffect } from 'react';
import { MediaItem } from '../types';

export const useGallery = (media: MediaItem[] = []) => {
  // Core state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState<Record<number, boolean>>({});
  const [preloadedImages, setPreloadedImages] = useState<Record<number, boolean>>({});
  
  // References
  const galleryRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<{ [key: number]: HTMLVideoElement | null }>({});
  
  // Process and validate media
  const validMedia = media.filter(item => item && item.url && (item.type === 'image' || item.type === 'video'));
  
  // Get current media item
  const currentItem = validMedia[currentIndex] || { type: 'image', url: '' };
  
  // Check if there are any items
  const hasItems = validMedia.length > 0;
  
  // Get type of current item
  const isVideo = currentItem?.type === 'video';
  
  // Calculate thumbnail gallery dimensions
  const calculateResponsiveDimensions = useCallback(() => {
    // Base height for thumbnails
    const baseHeight = 80; 
    
    // Determine number of items to show based on screen width
    const itemsToShow = typeof window !== 'undefined' ? 
      (window.innerWidth < 640 ? 3 : window.innerWidth < 1024 ? 4 : 5) : 5;
    
    return { 
      height: baseHeight,
      itemsToShow
    };
  }, []);
  
  const { height, itemsToShow } = calculateResponsiveDimensions();
  
  // Methods to navigate between items
  const goToNext = useCallback(() => {
    if (validMedia.length <= 1) return;
    setCurrentIndex(current => (current + 1) % validMedia.length);
  }, [validMedia.length]);
  
  const goToPrevious = useCallback(() => {
    if (validMedia.length <= 1) return;
    setCurrentIndex(current => (current - 1 + validMedia.length) % validMedia.length);
  }, [validMedia.length]);
  
  const goToIndex = useCallback((index: number) => {
    if (index >= 0 && index < validMedia.length) {
      setCurrentIndex(index);
    }
  }, [validMedia.length]);
  
  // Handle media controls
  const handleNext = useCallback(() => {
    goToNext();
  }, [goToNext]);
  
  const handlePrevious = useCallback(() => {
    goToPrevious();
  }, [goToPrevious]);
  
  const handleThumbnailClick = useCallback((index: number) => {
    goToIndex(index);
  }, [goToIndex]);
  
  // Toggle fullscreen mode
  const enterFullscreen = useCallback(() => {
    setIsFullscreen(true);
  }, []);
  
  const exitFullscreen = useCallback(() => {
    setIsFullscreen(false);
  }, []);
  
  // Toggle play state for videos
  const togglePlay = useCallback(() => {
    setIsPlaying(prev => !prev);
    
    const video = videoRefs.current[currentIndex];
    if (video) {
      if (video.paused) {
        video.play().catch(() => {
          // Handle autoplay restrictions
          setMediaError("Video playback was blocked. Please interact with the video to play.");
        });
      } else {
        video.pause();
      }
    }
  }, [currentIndex]);
  
  // Handle media errors
  const handleMediaError = useCallback((type: 'image' | 'video', index: number) => {
    const errorMessage = `Failed to load ${type === 'image' ? 'image' : 'video'} at position ${index + 1}`;
    setMediaError(errorMessage);
  }, []);
  
  // Handle image loading
  const handleImageLoad = useCallback((index: number) => {
    setImageLoading(prev => ({ ...prev, [index]: false }));
    setPreloadedImages(prev => ({ ...prev, [index]: true }));
  }, []);
  
  // Initialize loading state for images
  useEffect(() => {
    const newLoadingState: Record<number, boolean> = {};
    validMedia.forEach((_, index) => {
      newLoadingState[index] = true;
    });
    setImageLoading(newLoadingState);
    
    // Preload the first few images
    validMedia.slice(0, 3).forEach((item, index) => {
      if (item.type === 'image') {
        const img = new Image();
        img.src = item.url;
        img.onload = () => handleImageLoad(index);
      }
    });
  }, [validMedia, handleImageLoad]);
  
  // Calculate visible thumbnails (for scrolling thumbnail gallery)
  const getVisibleThumbnails = useCallback(() => {
    if (validMedia.length <= itemsToShow) {
      // If we have fewer items than can be shown, return all
      return { start: 0, end: validMedia.length - 1 };
    }
    
    // Calculate center of the window
    const halfWindow = Math.floor(itemsToShow / 2);
    
    // If we're near the start
    if (currentIndex <= halfWindow) {
      return { start: 0, end: itemsToShow - 1 };
    }
    
    // If we're near the end
    if (currentIndex >= validMedia.length - halfWindow - 1) {
      return { start: validMedia.length - itemsToShow, end: validMedia.length - 1 };
    }
    
    // If we're in the middle
    return { 
      start: currentIndex - halfWindow, 
      end: currentIndex + halfWindow + (itemsToShow % 2 === 0 ? 0 : 1) 
    };
  }, [currentIndex, validMedia.length, itemsToShow]);
  
  // Check if an index is the current index
  const isCurrentIndex = useCallback((index: number) => index === currentIndex, [currentIndex]);
  
  // Check if we can navigate
  const canGoNext = validMedia.length > 1 && currentIndex < validMedia.length - 1;
  const canGoPrevious = validMedia.length > 1 && currentIndex > 0;
  
  return {
    // Core state
    currentItem,
    currentIndex,
    hasItems,
    isVideo,
    isFullscreen,
    isPlaying,
    mediaError,
    imageLoading,
    preloadedImages,
    height,
    itemsToShow,
    validMedia,
    
    // Refs
    galleryRef,
    videoRefs,
    
    // Navigation methods
    goToNext,
    goToPrevious,
    goToIndex,
    handleNext,
    handlePrevious,
    handleThumbnailClick,
    
    // Fullscreen controls
    enterFullscreen,
    exitFullscreen,
    
    // Media controls
    togglePlay,
    setIsPlaying,
    
    // Error handling
    handleMediaError,
    setMediaError,
    
    // Image loading
    handleImageLoad,
    
    // Helper methods
    getVisibleThumbnails,
    isCurrentIndex,
    
    // Navigation states
    canGoNext,
    canGoPrevious,
  };
};
