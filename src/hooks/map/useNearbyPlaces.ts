
import { useCallback, useState } from "react";

export function useNearbyPlaces(map: google.maps.Map | null, isReady: boolean) {
  const [nearbyPlaces, setNearbyPlaces] = useState<Array<{
    name: string;
    position: { lat: number; lng: number };
    icon?: string;
    type: string;
  }>>([]);

  const addNearbyPlaces = useCallback(() => {
    if (!map || !isReady || !window.google || !window.google.maps || !window.google.maps.places) return;

    const service = new window.google.maps.places.PlacesService(map);
    const center = map.getCenter();
    if (!center) return;

    const searchTypes = ['restaurant', 'school', 'transit_station'];
    searchTypes.forEach(type => {
      service.nearbySearch(
        {
          location: center,
          radius: 1000,
          type: type,
        },
        (results, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
            const newPlaces = results.slice(0, 5).map(place => ({
              name: place.name || 'Unnamed Place',
              position: {
                lat: place.geometry?.location.lat() || 0,
                lng: place.geometry?.location.lng() || 0
              },
              icon: place.icon,
              type: type
            }));
            setNearbyPlaces(prev => [...prev, ...newPlaces]);
            // Optionally, add markers for places here if desired.
          }
        }
      );
    });
  }, [map, isReady]);

  return { nearbyPlaces, addNearbyPlaces };
}
