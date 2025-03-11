
import { useEffect, useRef, useState, useCallback } from 'react';

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
  const attemptRef = useRef(0);

  const initializeMap = useCallback(() => {
    attemptRef.current += 1;
    console.log(`Attempt #${attemptRef.current} to initialize map:`, { 
      mapRef: mapRef.current, 
      latitude, 
      longitude,
      scriptLoaded,
      googleAvailable: !!window.google,
      mapsAvailable: !!window.google?.maps
    });

    // Guard against missing dependencies
    if (!mapRef.current) {
      console.error('Map container reference is not available');
      if (attemptRef.current > 5) {
        setMapError(true);
      }
      return;
    }

    if (!window.google?.maps) {
      console.error('Google Maps API is not available');
      if (attemptRef.current > 5) {
        setMapError(true);
      }
      return;
    }

    // Validate coordinates
    if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
      console.error('Invalid coordinates:', { latitude, longitude });
      setMapError(true);
      return;
    }

    try {
      console.log('Creating Google Map with coordinates:', { latitude, longitude });
      
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
  }, [latitude, longitude, scriptLoaded]);

  // Try to initialize the map whenever dependencies change
  useEffect(() => {
    if (scriptLoaded && !mapInitialized && mapRef.current && window.google?.maps) {
      console.log('All conditions met, initializing map now');
      initializeMap();
    }
  }, [scriptLoaded, mapInitialized, latitude, longitude, initializeMap]);

  // Reset attempt counter when dependencies change
  useEffect(() => {
    attemptRef.current = 0;
  }, [latitude, longitude]);

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
