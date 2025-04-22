
import { useCallback } from "react";

export function useMapErrorHandling(
  setError: (error: string | null) => void,
  mapRef: React.RefObject<HTMLDivElement>,
  location: { lat: number; lng: number },
  setMap: (map: google.maps.Map) => void,
  setIsReady: (ready: boolean) => void,
  isSingleProperty: boolean
) {
  const retryMapInitialization = useCallback(() => {
    setError(null);
    if (!mapRef.current) return;
    if (window.google && window.google.maps) {
      try {
        const mapOptions: google.maps.MapOptions = {
          center: location,
          zoom: (location.lat !== 0 || location.lng !== 0) ? 15 : 2,
          mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        };
        const newMap = new window.google.maps.Map(mapRef.current, mapOptions);
        setMap(newMap);
        setIsReady(true);
        // Can add marker here for single property...
      } catch {
        setError("Failed to initialize Google Maps");
      }
    }
  }, [setError, mapRef, location, setMap, setIsReady, isSingleProperty]);
  return { retryMapInitialization };
}
