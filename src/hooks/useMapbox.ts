
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import { PropertyData } from '@/components/PropertyCard';
import { useToast } from '@/components/ui/use-toast';

export const useMapbox = (
  properties: PropertyData[],
  userLocation: { lat: number; lng: number } | null,
  showAllPropertiesOnLoad: boolean = false
) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [mapStyle, setMapStyle] = useState<'streets' | 'satellite' | 'light'>('streets');
  const { toast } = useToast();

  // Calculate center point for the map
  const defaultCenter = useMemo(() => {
    const validProperties = properties.filter(p => p.latitude && p.longitude);
    
    if (validProperties.length > 0) {
      const totalLat = validProperties.reduce((sum, p) => sum + (p.latitude || 0), 0);
      const totalLng = validProperties.reduce((sum, p) => sum + (p.longitude || 0), 0);
      return [totalLng / validProperties.length, totalLat / validProperties.length] as [number, number];
    } else if (userLocation) {
      return [userLocation.lng, userLocation.lat] as [number, number];
    }
    
    return [-0.118092, 51.509865] as [number, number]; // Default to London
  }, [properties, userLocation]);

  // Initialize map
  const initializeMap = useCallback(() => {
    if (!mapContainer.current || map.current) return;

    try {
      mapboxgl.accessToken = 'pk.eyJ1IjoiMjRtc2NzMTAiLCJhIjoiY204MnhzajRxMWt2aTJycTh2ZHc0aWZldCJ9.DnpQkiPBocF3mh-5VM77KA';
      
      const mapStyles = {
        streets: 'mapbox://styles/mapbox/streets-v11',
        satellite: 'mapbox://styles/mapbox/satellite-streets-v11',
        light: 'mapbox://styles/mapbox/light-v10'
      };
      
      const initializedMap = new mapboxgl.Map({
        container: mapContainer.current,
        style: mapStyles.streets,
        center: defaultCenter,
        zoom: 12,
        attributionControl: false,
        minZoom: 5
      });
      
      map.current = initializedMap;

      // Add navigation controls
      initializedMap.addControl(new mapboxgl.NavigationControl({
        showCompass: true,
        visualizePitch: true
      }), 'top-right');
      
      // Add attribution control in a more discrete position
      initializedMap.addControl(new mapboxgl.AttributionControl({
        compact: true
      }), 'bottom-right');

      // Add scale control
      initializedMap.addControl(new mapboxgl.ScaleControl({
        maxWidth: 100,
        unit: 'metric'
      }), 'bottom-left');

      initializedMap.on('load', () => {
        setMapInitialized(true);
        console.log("Map initialized successfully");
        
        // Add custom layer for better visualization
        initializedMap.addLayer({
          id: 'property-heat',
          type: 'heatmap',
          source: {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: properties
                .filter(p => p.latitude && p.longitude)
                .map(p => ({
                  type: 'Feature',
                  properties: {},
                  geometry: {
                    type: 'Point',
                    coordinates: [p.longitude, p.latitude]
                  }
                }))
            }
          },
          paint: {
            'heatmap-weight': 0.8,
            'heatmap-intensity': 0.3,
            'heatmap-color': [
              'interpolate',
              ['linear'],
              ['heatmap-density'],
              0, 'rgba(33,102,172,0)',
              0.2, 'rgb(103,169,207)',
              0.4, 'rgb(209,229,240)',
              0.6, 'rgb(253,219,199)',
              0.8, 'rgb(239,138,98)',
              1, 'rgb(178,24,43)'
            ],
            'heatmap-radius': 15,
            'heatmap-opacity': 0.7
          }
        });
      });
    } catch (error) {
      console.error("Error initializing map:", error);
      toast({
        title: "Map Error",
        description: "There was a problem loading the map. Please try again.",
        variant: "destructive"
      });
    }
  }, [defaultCenter, properties, toast]);

  // Change map style
  const changeMapStyle = useCallback(() => {
    if (!map.current || !mapInitialized) return;
    
    const styles: Array<'streets' | 'satellite' | 'light'> = ['streets', 'satellite', 'light'];
    const currentIndex = styles.indexOf(mapStyle);
    const nextIndex = (currentIndex + 1) % styles.length;
    const newStyle = styles[nextIndex];
    
    setMapStyle(newStyle);
    
    const styleUrls = {
      streets: 'mapbox://styles/mapbox/streets-v11',
      satellite: 'mapbox://styles/mapbox/satellite-streets-v11',
      light: 'mapbox://styles/mapbox/light-v10'
    };
    
    map.current.setStyle(styleUrls[newStyle]);
  }, [mapStyle, mapInitialized]);

  // Get user's current location
  const getUserLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLoc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          // Center map on user location
          if (map.current) {
            map.current.flyTo({
              center: [userLoc.lng, userLoc.lat],
              zoom: 13,
              essential: true
            });
          }

          toast({
            title: "Location found",
            description: "We've updated the map to show your current location",
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          toast({
            title: "Location error",
            description: "Could not access your location. Please check your browser permissions.",
            variant: "destructive",
          });
        }
      );
    } else {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support geolocation.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Fit map to show all properties
  const fitMapToProperties = useCallback(() => {
    if (!map.current || !mapInitialized || properties.length === 0) return;
    
    const validProperties = properties.filter(p => p.latitude && p.longitude);
    if (validProperties.length === 0) return;
    
    try {
      const bounds = new mapboxgl.LngLatBounds();
      
      // Add all property coordinates to bounds
      validProperties.forEach(property => {
        if (property.latitude && property.longitude) {
          bounds.extend([property.longitude, property.latitude]);
        }
      });
      
      // Add user location to bounds if available
      if (userLocation) {
        bounds.extend([userLocation.lng, userLocation.lat]);
      }
      
      // Fit map to bounds
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 15,
        duration: 1000
      });

      console.log("Map fitted to show all properties");
      
      toast({
        title: "Map updated",
        description: `Showing ${validProperties.length} properties${userLocation ? ' and your location' : ''}`,
      });
    } catch (error) {
      console.error("Error fitting map to properties:", error);
    }
  }, [mapInitialized, properties, userLocation, toast]);

  // Initialize map on mount
  useEffect(() => {
    initializeMap();
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [initializeMap]);

  // Automatically fit map to properties when component mounts
  useEffect(() => {
    if (mapInitialized && showAllPropertiesOnLoad) {
      setTimeout(() => {
        fitMapToProperties();
      }, 500);
    }
  }, [mapInitialized, showAllPropertiesOnLoad, fitMapToProperties]);

  return {
    mapContainer,
    map: map.current,
    mapInitialized,
    mapStyle,
    changeMapStyle,
    getUserLocation,
    fitMapToProperties
  };
};
