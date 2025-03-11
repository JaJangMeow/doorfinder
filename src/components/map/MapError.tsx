
import React from 'react';
import { Button } from '@/components/ui/button';

interface MapErrorProps {
  onTryAgain: () => void;
  onOpenInGoogleMaps: () => void;
}

export const MapError: React.FC<MapErrorProps> = ({ onTryAgain, onOpenInGoogleMaps }) => {
  return (
    <div className="w-full h-[400px] rounded-lg bg-muted flex flex-col items-center justify-center">
      <div className="text-center p-4">
        <p className="text-muted-foreground mb-4">Unable to load map. Please check the property location or try again later.</p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Button 
            variant="outline"
            onClick={onTryAgain}
          >
            Try again
          </Button>
          <Button 
            onClick={onOpenInGoogleMaps}
          >
            Open in Google Maps
          </Button>
        </div>
      </div>
    </div>
  );
};
