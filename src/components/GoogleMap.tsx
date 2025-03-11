
import React from 'react';
import { Button } from '@/components/ui/button';
import { useGoogleMapsScript } from '@/hooks/useGoogleMapsScript';
import { useGoogleMap } from '@/hooks/useGoogleMap';
import { MapError } from './map/MapError';
import { MapLoading } from './map/MapLoading';

interface GoogleMapProps {
  latitude: number;
  longitude: number;
}

const GoogleMap: React.FC<GoogleMapProps> = ({ latitude, longitude }) => {
  const { loaded: scriptLoaded, error: scriptError } = useGoogleMapsScript();
  const { 
    mapRef, 
    isReady: mapIsReady, 
    error: mapError, 
    retryMapInitialization 
  } = useGoogleMap({ 
    latitude, 
    longitude, 
    googleMapsLoaded: scriptLoaded 
  });

  const handleTryAgain = () => {
    retryMapInitialization();
  };

  const handleOpenInGoogleMaps = () => {
    window.open(`https://www.google.com/maps?q=${latitude},${longitude}`, '_blank');
  };

  // Show error state if any errors occurred
  if (mapError || scriptError) {
    return <MapError onTryAgain={handleTryAgain} onOpenInGoogleMaps={handleOpenInGoogleMaps} />;
  }

  // Show loading state if map is not ready yet
  if (!mapIsReady) {
    return <MapLoading />;
  }

  // Render the map
  return (
    <div className="relative w-full h-[400px]">
      <div 
        ref={mapRef} 
        className="w-full h-full rounded-lg shadow-md"
      />
      <Button 
        size="sm"
        variant="secondary"
        className="absolute bottom-4 right-4 shadow-md"
        onClick={handleOpenInGoogleMaps}
      >
        Open in Google Maps
      </Button>
    </div>
  );
};

export default GoogleMap;
