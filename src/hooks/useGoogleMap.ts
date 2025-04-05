import { useState, useEffect, useRef, useCallback } from 'react';

interface UseGoogleMapProps {
  latitude: number;
  longitude: number;
  googleMapsLoaded: boolean;
}

interface NearbyPlace {
  name: string;
  rating: number;
  user_ratings_total: number;
  vicinity: string;
  types: string[];
}

export const useGoogleMap = ({
  latitude,
  longitude,
  googleMapsLoaded
}: UseGoogleMapProps) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  const defaultLocation = { lat: 40.7128, lng: -74.0060 }; // New York coordinates as default

  const mapOptions: google.maps.MapOptions = {
    center: { lat: latitude || defaultLocation.lat, lng: longitude || defaultLocation.lng },
    zoom: 15,
    mapId: 'YOUR_MAP_ID',
    gestureHandling: 'cooperative',
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
  };

  const initializeMap = useCallback(() => {
    if (!googleMapsLoaded || !mapRef.current) return;

    try {
      const newMap = new google.maps.Map(mapRef.current, mapOptions);

      setMap(newMap);
      setIsReady(true);
      setError(null);

      // Add a single marker for the property location
      const propertyMarker = new google.maps.Marker({
        position: { lat: latitude || defaultLocation.lat, lng: longitude || defaultLocation.lng },
        map: newMap,
        title: 'Property Location',
      });

      setMarkers([propertyMarker]);
    } catch (err: any) {
      console.error("Failed to initialize map:", err);
      setError("Failed to initialize map. Please check your connection and try again.");
      setIsReady(false);
    }
  }, [googleMapsLoaded, latitude, longitude, mapOptions]);

  useEffect(() => {
    if (googleMapsLoaded && mapRef.current) {
      initializeMap();
    }
  }, [googleMapsLoaded, latitude, longitude, initializeMap]);

  const retryMapInitialization = () => {
    setIsReady(false);
    setError(null);
    initializeMap();
  };

  const addNearbyPlaces = useCallback(() => {
    if (!map) return;

    const service = new google.maps.places.PlacesService(map);
    const location = new google.maps.LatLng(latitude || defaultLocation.lat, longitude || defaultLocation.lng);
    const request = {
      location: location,
      radius: '500',
      type: ['restaurant', 'school', 'transit_station'],
    };

    service.nearbySearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        const nearby = results.map(result => {
          return {
            name: result.name,
            rating: result.rating || 0,
            user_ratings_total: result.user_ratings_total || 0,
            vicinity: result.vicinity || 'No address provided',
            types: result.types || [],
          };
        });
        setNearbyPlaces(nearby);

        // Add markers for nearby places
        results.forEach(result => {
          if (result.geometry && result.geometry.location) {
            const marker = new google.maps.Marker({
              position: result.geometry.location,
              map: map,
              title: result.name,
            });

            // Add info window for each marker
            const infowindow = new google.maps.InfoWindow({
              content: `<b>${result.name}</b><br>${result.vicinity || 'No address provided'}`
            });

            marker.addListener('click', () => {
              infowindow.open(map, marker);
            });

            setMarkers(prevMarkers => [...prevMarkers, marker]);
          }
        });
      }
    });
  }, [latitude, longitude, map]);

  // Cleanup markers on unmount
  useEffect(() => {
    return () => {
      markers.forEach(marker => marker.setMap(null));
      setMarkers([]);
    };
  }, [markers]);

  return {
    mapRef,
    map,
    isReady,
    error,
    retryMapInitialization,
    addNearbyPlaces,
    nearbyPlaces
  };
};
