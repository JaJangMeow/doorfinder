
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

  const validMedia = media.filter(item => item.url && (item.type === 'image' || item.type === 'video'));

  const preloadImages = useCallback(() => {
    const preloadState: Record<number, boolean> = {};
    
    validMedia.forEach((item, index) => {
      if (item.type === 'image') {
        preloadState[index] = false;
        const img = new Image();
        img.onload = () => {
          setPreloadedImages(prev => ({...prev, [index]: true}));
        };
        img.onerror = () => {
          console.error(`Failed to preload image at index ${index}`);
        };
        img.src = item.url;
      }
    });
    
    setPreloadedImages(preloadState);
  }, [validMedia]);

  const preloadAdjacentImages = useCallback((index: number) => {
    if (validMedia.length <= 1) return;
    
    const prevIndex = index === 0 ? validMedia.length - 1 : index - 1;
    const nextIndex = index === validMedia.length - 1 ? 0 : index + 1;
    
    [prevIndex, nextIndex].forEach(idx => {
      if (validMedia[idx]?.type === 'image' && !preloadedImages[idx]) {
        const img = new Image();
        img.onload = () => {
          setPreloadedImages(prev => ({...prev, [idx]: true}));
        };
        img.src = validMedia[idx].url;
      }
    });
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
      if (fullscreen) {
        preloadAdjacentImages(newIndex);
      }
      return newIndex;
    });
  }, [validMedia.length, pauseCurrentVideo, fullscreen, preloadAdjacentImages]);

  const handleNext = useCallback(() => {
    pauseCurrentVideo();
    setCurrentIndex(prevIndex => {
      const newIndex = prevIndex === validMedia.length - 1 ? 0 : prevIndex + 1;
      if (fullscreen) {
        preloadAdjacentImages(newIndex);
      }
      return newIndex;
    });
  }, [validMedia.length, pauseCurrentVideo, fullscreen, preloadAdjacentImages]);

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
    
    if (galleryRef.current.requestFullscreen) {
      galleryRef.current.requestFullscreen();
    }
    setFullscreen(true);
    
    preloadAdjacentImages(currentIndex);
  }, [currentIndex, preloadAdjacentImages]);

  const exitFullscreen = useCallback(() => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
    setFullscreen(false);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (fullscreen) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  }, [fullscreen, enterFullscreen, exitFullscreen]);

  const handleMediaError = (type: 'image' | 'video', index: number) => {
    console.error(`Error loading ${type} at index ${index}`);
    setMediaError(`Error loading ${type}. Please try again.`);
  };

  const handleImageLoad = (index: number) => {
    setImageLoading(prev => ({...prev, [index]: false}));
  };

  const handleThumbnailClick = (index: number) => {
    pauseCurrentVideo();
    setCurrentIndex(index);
  };

  useEffect(() => {
    const loadingState: Record<number, boolean> = {};
    validMedia.forEach((item, index) => {
      if (item.type === 'image') {
        loadingState[index] = true;
      }
    });
    setImageLoading(loadingState);
    
    preloadImages();
  }, [validMedia, preloadImages]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setFullscreen(document.fullscreenElement !== null);
      
      if (!document.fullscreenElement) {
        if (validMedia[currentIndex]?.type === 'video') {
          const video = videoRefs.current[currentIndex];
          if (video && !video.paused) {
            video.pause();
            setIsPlaying(false);
          }
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [currentIndex, validMedia]);

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
  }, [currentIndex, validMedia, isPlaying, fullscreen, handleNext, handlePrevious, togglePlay, exitFullscreen]);

  useEffect(() => {
    setCurrentIndex(0);
    setIsPlaying(false);
    setMediaError(null);
  }, [media]);

  useEffect(() => {
    if (validMedia.length > 0 && currentIndex >= validMedia.length) {
      setCurrentIndex(0);
    }
  }, [currentIndex, validMedia]);

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
