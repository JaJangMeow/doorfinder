
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useGoogleMapsScript } from '@/hooks/useGoogleMapsScript';
import { useGoogleMap } from '@/hooks/useGoogleMap';
import { MapError } from './map/MapError';
import { MapLoading } from './map/MapLoading';

interface GoogleMapProps {
  latitude: number;
  longitude: number;
}

declare global {
  interface Window {
    google: any;
  }
}

const GoogleMap: React.FC<GoogleMapProps> = ({ latitude, longitude }) => {
  const { scriptLoaded, scriptError } = useGoogleMapsScript();
  const { 
    mapRef, 
    mapLoaded, 
    mapError, 
    setMapError, 
    setMapLoaded, 
    setMapInitialized,
    initializeMap 
  } = useGoogleMap({ 
    latitude, 
    longitude, 
    scriptLoaded 
  });

  useEffect(() => {
    console.log('GoogleMap component rendered with:', { latitude, longitude, scriptLoaded, mapLoaded, mapError });
  }, [latitude, longitude, scriptLoaded, mapLoaded, mapError]);

  const handleTryAgain = () => {
    console.log('Trying again to load map');
    setMapError(false);
    setMapLoaded(false);
    setMapInitialized(false);
    initializeMap();
  };

  const handleOpenInGoogleMaps = () => {
    if (latitude && longitude) {
      window.open(`https://www.google.com/maps?q=${latitude},${longitude}`, '_blank');
    }
  };

  if (mapError || scriptError) {
    return <MapError onTryAgain={handleTryAgain} onOpenInGoogleMaps={handleOpenInGoogleMaps} />;
  }

  if (!mapLoaded) {
    return <MapLoading />;
  }

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
