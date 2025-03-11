
import { useEffect, useRef, useState } from 'react';

interface UseGoogleMapProps {
  latitude: number;
  longitude: number;
  scriptLoaded: boolean;
}

export const useGoogleMap = ({ latitude, longitude, scriptLoaded }: UseGoogleMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [mapInitialized, setMapInitialized] = useState(false);

  const initializeMap = () => {
    console.log('Attempting to initialize map...', { 
      mapRef: mapRef.current, 
      latitude, 
      longitude,
      scriptLoaded,
      googleMapsAvailable: !!window.google?.maps
    });

    if (!mapRef.current || !window.google?.maps) {
      console.error('Map reference or Google Maps not available');
      return;
    }

    if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
      console.error('Invalid coordinates:', { latitude, longitude });
      setMapError(true);
      return;
    }

    try {
      console.log('Creating map with coordinates:', { latitude, longitude });
      
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: latitude, lng: longitude },
        zoom: 15,
        mapTypeControl: true,
        fullscreenControl: true,
        streetViewControl: true,
        zoomControl: true,
      });

      new window.google.maps.Marker({
        position: { lat: latitude, lng: longitude },
        map: map,
        title: 'Property Location',
        animation: window.google.maps.Animation.DROP,
      });

      setMapLoaded(true);
      setMapError(false);
      setMapInitialized(true);
      console.log('Map successfully initialized');
    } catch (error) {
      console.error('Error initializing Google Map:', error);
      setMapError(true);
    }
  };

  useEffect(() => {
    if (scriptLoaded && !mapInitialized && mapRef.current && window.google?.maps) {
      console.log('All conditions met, initializing map');
      initializeMap();
    }
  }, [scriptLoaded, mapInitialized, latitude, longitude]);

  return { 
    mapRef, 
    mapLoaded, 
    mapError, 
    setMapError, 
    setMapLoaded, 
    setMapInitialized,
    initializeMap 
  };
};
