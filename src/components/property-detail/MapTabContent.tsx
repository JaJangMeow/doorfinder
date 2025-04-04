
import React from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink, Coffee } from 'lucide-react';
import MapErrorState from './MapErrorState';

interface MapTabContentProps {
  mapRef: React.RefObject<HTMLDivElement>;
  isReady: boolean;
  error: boolean;
  retryMapInitialization: () => void;
  showNearbyPlaces: boolean;
  onShowNearbyPlaces: () => void;
  onOpenGoogleMaps: () => void;
}

const MapTabContent: React.FC<MapTabContentProps> = ({
  mapRef,
  isReady,
  error,
  retryMapInitialization,
  showNearbyPlaces,
  onShowNearbyPlaces,
  onOpenGoogleMaps
}) => {
  return (
    <div className="h-[400px] relative">
      <div ref={mapRef} className="w-full h-full" />
      
      {!isReady && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      )}
      
      {error && (
        <MapErrorState 
          onRetry={retryMapInitialization} 
          message="Failed to load map"
        />
      )}
      
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        {isReady && !showNearbyPlaces && (
          <Button 
            size="sm"
            variant="secondary"
            className="shadow-md"
            onClick={onShowNearbyPlaces}
          >
            <Coffee className="mr-2 h-4 w-4" />
            Show Nearby Places
          </Button>
        )}
        <Button 
          size="sm"
          variant="secondary"
          className="shadow-md"
          onClick={onOpenGoogleMaps}
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          Google Maps
        </Button>
      </div>
    </div>
  );
};

export default MapTabContent;
