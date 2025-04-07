
import { useState, useRef, useEffect, useCallback } from 'react';
import { MediaItem } from '../types';

interface UseGalleryProps {
  media: MediaItem[];
}

export const useGallery = ({ media }: UseGalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState<Record<number, boolean>>({});
  const [preloadedImages, setPreloadedImages] = useState<Record<number, boolean>>({});
  const videoRefs = useRef<{ [key: number]: HTMLVideoElement | null }>({});
  const galleryRef = useRef<HTMLDivElement>(null);

  // Filter only valid media items
  const validMedia = media.filter(item => 
    item && 
    item.url && 
    typeof item.url === 'string' && 
    item.url.trim() !== '' &&
    (item.type === 'image' || item.type === 'video')
  );

  const preloadImages = useCallback(() => {
    if (validMedia.length === 0) return;
    
    const preloadState: Record<number, boolean> = {};
    const loadingState: Record<number, boolean> = {};
    
    validMedia.forEach((item, index) => {
      if (item.type === 'image') {
        preloadState[index] = false;
        loadingState[index] = true;
      }
    });
    
    setPreloadedImages(preloadState);
    setImageLoading(loadingState);
    
    // Prioritize loading current image
    if (validMedia[currentIndex]?.type === 'image') {
      const img = new Image();
      img.onload = () => {
        setPreloadedImages(prev => ({...prev, [currentIndex]: true}));
        setImageLoading(prev => ({...prev, [currentIndex]: false}));
      };
      img.onerror = () => {
        console.error(`Failed to preload primary image at index ${currentIndex}`);
        setImageLoading(prev => ({...prev, [currentIndex]: false}));
      };
      img.src = validMedia[currentIndex].url;
    }
  }, [validMedia, currentIndex]);

  const preloadAdjacentImages = useCallback((index: number) => {
    if (validMedia.length <= 1) return;
    
    const queue: number[] = [];
    
    const nextIndex = index === validMedia.length - 1 ? 0 : index + 1;
    const prevIndex = index === 0 ? validMedia.length - 1 : index - 1;
    
    if (validMedia[nextIndex]?.type === 'image' && !preloadedImages[nextIndex]) {
      queue.push(nextIndex);
    }
    
    if (validMedia[prevIndex]?.type === 'image' && !preloadedImages[prevIndex]) {
      queue.push(prevIndex);
    }
    
    validMedia.forEach((idx) => {
      if (idx !== index && idx !== nextIndex && idx !== prevIndex && 
          validMedia[Number(idx)]?.type === 'image' && !preloadedImages[Number(idx)]) {
        queue.push(Number(idx));
      }
    });
    
    let i = 0;
    const processQueue = () => {
      if (i < queue.length) {
        const idx = queue[i];
        const img = new Image();
        img.onload = () => {
          setPreloadedImages(prev => ({...prev, [idx]: true}));
          setImageLoading(prev => ({...prev, [idx]: false}));
          i++;
          setTimeout(processQueue, 100);
        };
        img.onerror = () => {
          console.error(`Failed to preload image at index ${idx}`);
          setImageLoading(prev => ({...prev, [idx]: false}));
          i++;
          setTimeout(processQueue, 100);
        };
        img.src = validMedia[idx].url;
      }
    };
    
    processQueue();
  }, [validMedia, preloadedImages]);

  const pauseCurrentVideo = useCallback(() => {
    if (validMedia[currentIndex]?.type === 'video') {
      const video = videoRefs.current[currentIndex];
      if (video) {
        video.pause();
        setIsPlaying(false);
      }
    }
  }, [currentIndex, validMedia]);

  const handlePrevious = useCallback(() => {
    pauseCurrentVideo();
    setCurrentIndex(prevIndex => {
      const newIndex = prevIndex === 0 ? validMedia.length - 1 : prevIndex - 1;
      return newIndex;
    });
  }, [validMedia.length, pauseCurrentVideo]);

  const handleNext = useCallback(() => {
    pauseCurrentVideo();
    setCurrentIndex(prevIndex => {
      const newIndex = prevIndex === validMedia.length - 1 ? 0 : prevIndex + 1;
      return newIndex;
    });
  }, [validMedia.length, pauseCurrentVideo]);

  const togglePlay = useCallback(() => {
    const video = videoRefs.current[currentIndex];
    if (video) {
      if (isPlaying) {
        video.pause();
      } else {
        video.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [currentIndex, isPlaying, videoRefs]);

  const enterFullscreen = useCallback(() => {
    if (!galleryRef.current) return;
    
    setFullscreen(true);
    
    // In fullscreen mode, attempt to use browser's fullscreen API
    if (galleryRef.current.requestFullscreen) {
      galleryRef.current.requestFullscreen().catch(err => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    }
  }, []);

  const exitFullscreen = useCallback(() => {
    setFullscreen(false);
    
    // Exit browser's fullscreen if active
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(err => {
        console.error('Error attempting to exit fullscreen:', err);
      });
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (fullscreen) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  }, [fullscreen, enterFullscreen, exitFullscreen]);

  const handleMediaError = useCallback((type: 'image' | 'video', index: number) => {
    console.error(`Error loading ${type} at index ${index}`);
    
    if (type === 'image') {
      setImageLoading(prev => ({...prev, [index]: false}));
      
      if (index === currentIndex) {
        setMediaError(`Error loading ${type}. Please try again.`);
      }
    } else {
      setMediaError(`Error loading ${type}. Please try again.`);
    }
  }, [currentIndex]);

  const handleImageLoad = useCallback((index: number) => {
    setImageLoading(prev => ({...prev, [index]: false}));
    setPreloadedImages(prev => ({...prev, [index]: true}));
    
    if (index === currentIndex && mediaError) {
      setMediaError(null);
    }
  }, [currentIndex, mediaError]);

  const handleThumbnailClick = useCallback((index: number) => {
    pauseCurrentVideo();
    setCurrentIndex(index);
  }, [pauseCurrentVideo]);

  // Initialize loading states and preload images only on initial render or when media changes
  useEffect(() => {
    const loadingState: Record<number, boolean> = {};
    validMedia.forEach((item, index) => {
      if (item.type === 'image') {
        loadingState[index] = true;
      }
    });
    
    setImageLoading(loadingState);
    preloadImages();
    
    setMediaError(null);
    setCurrentIndex(0);
    setIsPlaying(false);
  }, [media]); // Depend on media only, not validMedia

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isDocFullscreen = document.fullscreenElement !== null;
      
      // Only update state if it doesn't match the current fullscreen state
      if (fullscreen !== isDocFullscreen) {
        setFullscreen(isDocFullscreen);
      }
      
      if (!isDocFullscreen && validMedia[currentIndex]?.type === 'video') {
        const video = videoRefs.current[currentIndex];
        if (video && !video.paused) {
          video.pause();
          setIsPlaying(false);
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [currentIndex, fullscreen, validMedia]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === ' ' || e.key === 'Spacebar') {
        if (validMedia.length > 0 && validMedia[currentIndex]?.type === 'video') {
          e.preventDefault();
          togglePlay();
        }
      } else if (e.key === 'Escape' && fullscreen) {
        exitFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentIndex, validMedia, handleNext, handlePrevious, togglePlay, exitFullscreen, fullscreen]);

  // Ensure current index is valid
  useEffect(() => {
    if (validMedia.length > 0 && currentIndex >= validMedia.length) {
      setCurrentIndex(0);
    }
  }, [validMedia, currentIndex]);

  // Preload adjacent images when in fullscreen or when current index changes
  useEffect(() => {
    if (fullscreen || currentIndex !== undefined) {
      preloadAdjacentImages(currentIndex);
    }
  }, [fullscreen, currentIndex, preloadAdjacentImages]);

  return {
    validMedia,
    currentIndex,
    isPlaying,
    fullscreen,
    mediaError,
    imageLoading,
    preloadedImages,
    videoRefs,
    galleryRef,
    handlePrevious,
    handleNext,
    togglePlay,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen,
    handleMediaError,
    handleImageLoad,
    handleThumbnailClick,
    setIsPlaying,
    setMediaError
  };
};
