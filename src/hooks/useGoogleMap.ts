import { useRef, useState, useEffect, useCallback } from 'react';

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

  const initializeMap = useCallback(() => {
    if (!mapRef.current || !window.google?.maps) return false;
    
    try {
      if (!mapInstanceRef.current) {
        mapInstanceRef.current = new google.maps.Map(mapRef.current, {
          center: { lat: latitude, lng: longitude },
          zoom: 15,
          mapTypeControl: true,
          fullscreenControl: true,
          streetViewControl: true,
          zoomControl: true,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'on' }]
            },
            {
              featureType: 'transit',
              elementType: 'labels',
              stylers: [{ visibility: 'on' }]
            }
          ]
        });
        
        markerRef.current = new google.maps.Marker({
          position: { lat: latitude, lng: longitude },
          map: mapInstanceRef.current,
          title: 'Property Location',
          animation: google.maps.Animation.DROP,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#ff3e00',
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: '#ffffff',
          }
        });
        
        setMapState({ isReady: true, error: false });
        return true;
      }
      return true;
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapState({ isReady: false, error: true });
      return false;
    }
  }, [latitude, longitude]);

  useEffect(() => {
    if (!googleMapsLoaded || !mapRef.current) return;
    
    if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
      setMapState({ isReady: false, error: true });
      return;
    }

    if (mapInstanceRef.current) {
      const center = new google.maps.LatLng(latitude, longitude);
      mapInstanceRef.current.setCenter(center);
      
      if (markerRef.current) {
        markerRef.current.setPosition(center);
      }
    } else {
      initializeMap();
    }
  }, [latitude, longitude, googleMapsLoaded, initializeMap]);

  useEffect(() => {
    if (!googleMapsLoaded) return;
    
    if (!mapInstanceRef.current) {
      initializeMap();
    }
    
    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
    };
  }, [googleMapsLoaded, initializeMap]);

  const retryMapInitialization = useCallback(() => {
    if (markerRef.current) {
      markerRef.current.setMap(null);
      markerRef.current = null;
    }
    
    mapInstanceRef.current = null;
    setMapState({ isReady: false, error: false });
    
    setTimeout(() => {
      initializeMap();
    }, 100);
  }, [initializeMap]);

  const addNearbyPlaces = useCallback((types: string[] = ['restaurant', 'school', 'transit_station']) => {
    if (!mapInstanceRef.current || !window.google?.maps || !markerRef.current) return;
    
    const location = markerRef.current.getPosition();
    if (!location) return;
    
    const service = new google.maps.places.PlacesService(mapInstanceRef.current);
    
    types.forEach(type => {
      service.nearbySearch(
        {
          location,
          radius: 500,
          type
        },
        (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            results.slice(0, 5).forEach(place => {
              if (place.geometry?.location) {
                const placeLocation = place.geometry.location;
                const position = {
                  lat: placeLocation.lat(),
                  lng: placeLocation.lng()
                };
                
                new google.maps.Marker({
                  map: mapInstanceRef.current,
                  position,
                  title: place.name,
                  icon: {
                    url: place.icon || '',
                    scaledSize: new google.maps.Size(20, 20)
                  }
                });
              }
            });
          }
        }
      );
    });
  }, []);

  return {
    mapRef,
    isReady: mapState.isReady,
    error: mapState.error,
    retryMapInitialization,
    addNearbyPlaces
  };
};
