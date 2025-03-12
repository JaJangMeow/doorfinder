
import React from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { MapPin, ExternalLink, Navigation } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useEffect, useRef, useState } from 'react';

interface PropertyLocationProps {
  latitude?: number;
  longitude?: number;
  address: string;
}

const PropertyLocation: React.FC<PropertyLocationProps> = ({
  latitude,
  longitude,
  address
}) => {
  const { toast } = useToast();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  const hasValidCoordinates = 
    latitude !== undefined && 
    longitude !== undefined && 
    !isNaN(Number(latitude)) && 
    !isNaN(Number(longitude)) &&
    Number(latitude) !== 0 &&
    Number(longitude) !== 0;

  useEffect(() => {
    if (!hasValidCoordinates || !mapContainer.current || map.current) return;

    const lat = Number(latitude);
    const lng = Number(longitude);

    mapboxgl.accessToken = 'pk.eyJ1IjoiMjRtc2NzMTAiLCJhIjoiY204MnhzajRxMWt2aTJycTh2ZHc0aWZldCJ9.DnpQkiPBocF3mh-5VM77KA';
    
    try {
      const initializedMap = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [lng, lat],
        zoom: 15,
        pitch: 45 // Add a slight tilt for better 3D context
      });
      
      map.current = initializedMap;

      // Add navigation controls (zoom, rotate, etc.)
      initializedMap.addControl(new mapboxgl.NavigationControl(), 'top-right');
      
      // Create a marker at the property location
      const initialMarker = new mapboxgl.Marker({ color: '#FF0000' })
        .setLngLat([lng, lat])
        .addTo(initializedMap);
      
      marker.current = initialMarker;

      // Set map as loaded when it's fully initialized
      initializedMap.on('load', () => {
        setMapLoaded(true);
        
        // Add 3D buildings for more context if zoomed in enough
        initializedMap.addLayer({
          'id': '3d-buildings',
          'source': 'composite',
          'source-layer': 'building',
          'filter': ['==', 'extrude', 'true'],
          'type': 'fill-extrusion',
          'minzoom': 15,
          'paint': {
            'fill-extrusion-color': '#aaa',
            'fill-extrusion-height': [
              'interpolate', ['linear'], ['zoom'],
              15, 0,
              15.05, ['get', 'height']
            ],
            'fill-extrusion-base': [
              'interpolate', ['linear'], ['zoom'],
              15, 0,
              15.05, ['get', 'min_height']
            ],
            'fill-extrusion-opacity': 0.6
          }
        });
      });

      return () => {
        initializedMap.remove();
      };
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }, [hasValidCoordinates, latitude, longitude]);

  const handleOpenGoogleMaps = () => {
    const mapsUrl = hasValidCoordinates
      ? `https://www.google.com/maps?q=${latitude},${longitude}`
      : `https://www.google.com/maps/search/${encodeURIComponent(address)}`;
    
    window.open(mapsUrl, '_blank');
  };

  const handleOpenGoogleStreetView = () => {
    if (!hasValidCoordinates) return;
    
    // Google Street View URL format
    const streetViewUrl = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${latitude},${longitude}`;
    window.open(streetViewUrl, '_blank');
  };

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <MapPin className="mr-2 text-primary" size={20} />
          Location
        </h2>
        <div className="flex gap-2">
          <Button 
            variant="default" 
            size="sm"
            onClick={handleOpenGoogleMaps}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Open in Google Maps
          </Button>
        </div>
      </div>
      
      {hasValidCoordinates ? (
        <div className="rounded-xl overflow-hidden h-[400px] relative">
          <div ref={mapContainer} className="w-full h-full rounded-lg" />
          {!mapLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
          )}
          <div className="absolute bottom-4 right-4">
            <Button 
              size="sm"
              variant="secondary"
              className="shadow-md"
              onClick={handleOpenGoogleMaps}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Google Maps
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden bg-muted h-[400px] flex items-center justify-center">
          <div className="text-center p-4">
            <p className="text-muted-foreground mb-4">Map coordinates not available</p>
            <Button 
              onClick={handleOpenGoogleMaps}
            >
              Search Address in Google Maps
            </Button>
          </div>
        </div>
      )}
      
      <div className="mt-3 flex items-start">
        <MapPin className="mt-0.5 mr-2 h-5 w-5 text-muted-foreground flex-shrink-0" />
        <p className="text-muted-foreground">{address}</p>
      </div>
      
      {hasValidCoordinates && (
        <p className="mt-1 ml-7 text-sm text-muted-foreground">
          Coordinates: {latitude}, {longitude}
        </p>
      )}
    </div>
  );
};

export default PropertyLocation;
