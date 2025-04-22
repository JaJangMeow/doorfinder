
import { useState, useCallback } from 'react';
import { MediaItem } from '../types';

export const useGallery = (media: MediaItem[] = []) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Get current media item
  const currentItem = media[currentIndex] || { type: 'image', url: '' };
  
  // Check if there are any items
  const hasItems = media.length > 0;
  
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
    if (media.length <= 1) return;
    setCurrentIndex(current => (current + 1) % media.length);
  }, [media.length]);
  
  const goToPrevious = useCallback(() => {
    if (media.length <= 1) return;
    setCurrentIndex(current => (current - 1 + media.length) % media.length);
  }, [media.length]);
  
  const goToIndex = useCallback((index: number) => {
    if (index >= 0 && index < media.length) {
      setCurrentIndex(index);
    }
  }, [media.length]);
  
  // Toggle fullscreen mode
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(current => !current);
  }, []);
  
  // Calculate visible thumbnails (for scrolling thumbnail gallery)
  const getVisibleThumbnails = useCallback(() => {
    if (media.length <= itemsToShow) {
      // If we have fewer items than can be shown, return all
      return { start: 0, end: media.length - 1 };
    }
    
    // Calculate center of the window
    const halfWindow = Math.floor(itemsToShow / 2);
    
    // If we're near the start
    if (currentIndex <= halfWindow) {
      return { start: 0, end: itemsToShow - 1 };
    }
    
    // If we're near the end
    if (currentIndex >= media.length - halfWindow - 1) {
      return { start: media.length - itemsToShow, end: media.length - 1 };
    }
    
    // If we're in the middle
    return { 
      start: currentIndex - halfWindow, 
      end: currentIndex + halfWindow + (itemsToShow % 2 === 0 ? 0 : 1) 
    };
  }, [currentIndex, media.length, itemsToShow]);
  
  // Check if an index is the current index
  const isCurrentIndex = (index: number) => index === currentIndex;
  
  // Check if we can navigate
  const canGoNext = media.length > 1 && currentIndex < media.length - 1;
  const canGoPrevious = media.length > 1 && currentIndex > 0;
  
  return {
    currentItem,
    currentIndex,
    hasItems,
    isVideo,
    isFullscreen,
    height,
    itemsToShow,
    goToNext,
    goToPrevious,
    goToIndex,
    toggleFullscreen,
    getVisibleThumbnails,
    isCurrentIndex,
    canGoNext,
    canGoPrevious
  };
};
