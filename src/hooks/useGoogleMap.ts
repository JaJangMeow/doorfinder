
import { useRef, useState, useEffect } from 'react';

interface UseGoogleMapProps {
  latitude: number;
  longitude: number;
  googleMapsLoaded: boolean;
}

export const useGoogleMap = ({ latitude, longitude, googleMapsLoaded }: UseGoogleMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  
  const [mapState, setMapState] = useState({
    isReady: false,
    error: false
  });

  // Reset state when coordinates change
  useEffect(() => {
    if (mapInstanceRef.current) {
      // Update existing map with new coordinates
      const center = new google.maps.LatLng(latitude, longitude);
      mapInstanceRef.current.setCenter(center);
      
      if (markerRef.current) {
        markerRef.current.setPosition(center);
      }
    }
  }, [latitude, longitude]);

  // Initialize or re-initialize map when dependencies change
  useEffect(() => {
    // Make sure we have Google Maps loaded and valid coordinates
    if (!googleMapsLoaded || !mapRef.current || !window.google?.maps) {
      return;
    }
    
    // Validate coordinates
    if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
      setMapState({ isReady: false, error: true });
      return;
    }

    try {
      // Create map instance if it doesn't exist
      if (!mapInstanceRef.current) {
        mapInstanceRef.current = new google.maps.Map(mapRef.current, {
          center: { lat: latitude, lng: longitude },
          zoom: 15,
          mapTypeControl: true,
          fullscreenControl: true,
          streetViewControl: true,
          zoomControl: true,
        });
        
        // Add marker
        markerRef.current = new google.maps.Marker({
          position: { lat: latitude, lng: longitude },
          map: mapInstanceRef.current,
          title: 'Property Location',
          animation: google.maps.Animation.DROP,
        });
        
        setMapState({ isReady: true, error: false });
      }
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapState({ isReady: false, error: true });
    }
  }, [latitude, longitude, googleMapsLoaded]);

  // Function to retry map initialization
  const retryMapInitialization = () => {
    // Clear existing instances
    if (markerRef.current) {
      markerRef.current.setMap(null);
      markerRef.current = null;
    }
    
    mapInstanceRef.current = null;
    setMapState({ isReady: false, error: false });
  };

  return {
    mapRef,
    isReady: mapState.isReady,
    error: mapState.error,
    retryMapInitialization
  };
};
