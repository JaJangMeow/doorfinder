
import { useState, useEffect, useRef } from "react";

export function useGoogleMapCore({ location, isSingleProperty, googleMapsLoaded }: {
  location: { lat: number; lng: number }, 
  isSingleProperty: boolean,
  googleMapsLoaded: boolean
}) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);

  // Core map initialization and cleanup logic
  useEffect(() => {
    // Clean up function to remove previous map and markers
    const cleanUp = () => {
      setMap(null);
    };
    if (!googleMapsLoaded || !mapRef.current || !window.google || !window.google.maps) return cleanUp;

    try {
      const mapOptions: google.maps.MapOptions = {
        center: location,
        zoom: (location.lat !== 0 || location.lng !== 0) ? 15 : 2,
        mapTypeControl: true,
        streetViewControl: true,
        zoomControl: true,
        fullscreenControl: false,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
      const newMap = new window.google.maps.Map(mapRef.current, mapOptions);
      setMap(newMap);
      setIsReady(true);
      setError(null);

      return cleanUp;
    } catch (err) {
      setError("Failed to initialize Google Maps");
      setIsReady(false);
      return cleanUp;
    }
  }, [location, isSingleProperty, googleMapsLoaded]);

  return { mapRef, map, isReady, error, setError, setIsReady };
}
