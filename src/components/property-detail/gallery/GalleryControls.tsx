
import React from 'react';
import { ChevronLeft, ChevronRight, Heart, Maximize, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GalleryControlsProps {
  isFullscreen: boolean;
  isVideo: boolean;
  isPlaying: boolean;
  isSaved: boolean;
  isLoading: boolean;
  hasMultipleMedia: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onTogglePlay: () => void;
  onSaveToggle: () => void;
  onEnterFullscreen: () => void;
}

const GalleryControls: React.FC<GalleryControlsProps> = ({
  isFullscreen,
  isVideo,
  isPlaying,
  isSaved,
  isLoading,
  hasMultipleMedia,
  onPrevious,
  onNext,
  onTogglePlay,
  onSaveToggle,
  onEnterFullscreen
}) => {
  return (
    <>
      {isVideo && !isFullscreen && (
        <Button 
          variant="outline" 
          size="icon" 
          onClick={onTogglePlay}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-sm hover:bg-white rounded-full"
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </Button>
      )}

      {hasMultipleMedia && !isFullscreen && (
        <>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={onPrevious}
            className="absolute top-1/2 left-4 -translate-y-1/2 bg-white/80 backdrop-blur-sm hover:bg-white rounded-full"
          >
            <ChevronLeft size={20} />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={onNext}
            className="absolute top-1/2 right-4 -translate-y-1/2 bg-white/80 backdrop-blur-sm hover:bg-white rounded-full"
          >
            <ChevronRight size={20} />
          </Button>
        </>
      )}

      {!isFullscreen && (
        <div className="absolute top-4 right-4 flex gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={onSaveToggle}
            disabled={isLoading}
            className="bg-white/80 backdrop-blur-sm hover:bg-white"
          >
            <Heart 
              className={isSaved ? "fill-primary text-primary" : "text-muted-foreground"} 
              size={20} 
            />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={onEnterFullscreen}
            className="bg-white/80 backdrop-blur-sm hover:bg-white"
          >
            <Maximize size={20} />
            <span className="sr-only">Fullscreen</span>
          </Button>
        </div>
      )}
    </>
  );
};

export default GalleryControls;
