
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

interface Coordinates {
  lat: number;
  lng: number;
}

interface LocationPickerProps {
  onLocationSelect: (coordinates: Coordinates) => void;
  defaultLocation?: Coordinates;
  className?: string;
  height?: string;
  zoom?: number;
}

const LocationPicker: React.FC<LocationPickerProps> = ({ 
  onLocationSelect, 
  defaultLocation = { lat: 12.9716, lng: 77.5946 }, // Default to Bangalore coordinates
  className,
  height = '300px',
  zoom = 12
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [coordinates, setCoordinates] = useState<Coordinates>(defaultLocation);
  const [isLocating, setIsLocating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize Mapbox with your token
    mapboxgl.accessToken = 'pk.eyJ1IjoiMjRtc2NzMTAiLCJhIjoiY204MnhzajRxMWt2aTJycTh2ZHc0aWZldCJ9.DnpQkiPBocF3mh-5VM77KA';
    
    const initializedMap = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11', // Updated to use Mapbox's default style
      center: [coordinates.lng, coordinates.lat],
      zoom: zoom
    });
    
    map.current = initializedMap;

    // Add navigation controls
    initializedMap.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add initial marker
    const initialMarker = new mapboxgl.Marker({ draggable: true, color: '#FF0000' })
      .setLngLat([coordinates.lng, coordinates.lat])
      .addTo(initializedMap);
    
    marker.current = initialMarker;

    // Add event listener for when marker is dragged
    initialMarker.on('dragend', () => {
      const lngLat = initialMarker.getLngLat();
      const newCoordinates = {
        lat: lngLat.lat,
        lng: lngLat.lng
      };
      setCoordinates(newCoordinates);
      onLocationSelect(newCoordinates);
    });

    // Add event listener for map clicks to move marker
    initializedMap.on('click', (e) => {
      if (marker.current) {
        marker.current.setLngLat([e.lngLat.lng, e.lngLat.lat]);
        
        const newCoordinates = {
          lat: e.lngLat.lat,
          lng: e.lngLat.lng
        };
        
        setCoordinates(newCoordinates);
        onLocationSelect(newCoordinates);
      }
    });

    // Clean up on unmount
    return () => {
      initializedMap.remove();
    };
  }, [onLocationSelect, zoom]);

  // Update marker if defaultLocation changes
  useEffect(() => {
    if (map.current && marker.current && defaultLocation) {
      marker.current.setLngLat([defaultLocation.lng, defaultLocation.lat]);
      map.current.flyTo({
        center: [defaultLocation.lng, defaultLocation.lat],
        essential: true
      });
      setCoordinates(defaultLocation);
    }
  }, [defaultLocation]);

  const getCurrentLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newCoordinates = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          if (map.current && marker.current) {
            marker.current.setLngLat([newCoordinates.lng, newCoordinates.lat]);
            map.current.flyTo({
              center: [newCoordinates.lng, newCoordinates.lat],
              zoom: 15,
              essential: true
            });
          }
          
          setCoordinates(newCoordinates);
          onLocationSelect(newCoordinates);
          setIsLocating(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsLocating(false);
          toast({
            title: "Location error",
            description: "Could not access your location. Please search or manually place the marker.",
            variant: "destructive",
          });
        }
      );
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    try {
      // Use Mapbox Geocoding API to search for places
      const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${mapboxgl.accessToken}&proximity=ip&types=address,place,locality,neighborhood&country=in`);
      
      if (!response.ok) throw new Error('Search failed');
      
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const firstResult = data.features[0];
        const [lng, lat] = firstResult.center;
        
        const newCoordinates = {
          lat,
          lng
        };
        
        if (map.current && marker.current) {
          marker.current.setLngLat([lng, lat]);
          map.current.flyTo({
            center: [lng, lat],
            zoom: 15,
            essential: true
          });
        }
        
        setCoordinates(newCoordinates);
        onLocationSelect(newCoordinates);
        
        toast({
          title: "Location found",
          description: `Found: ${firstResult.place_name}. You can adjust the pin if needed.`,
        });
      } else {
        toast({
          title: "No results found",
          description: "Try a different search term or place the marker manually",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search failed",
        description: "There was an error searching for this location",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className={`${className || ''}`}>
      <div className="glass mb-2">
        <form onSubmit={handleSearch} className="flex gap-2 mb-2">
          <Input
            placeholder="Search for address, landmark, or area"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button 
            type="submit" 
            variant="secondary"
            disabled={isSearching}
          >
            <Search size={16} className="mr-2" />
            {isSearching ? 'Searching...' : 'Search'}
          </Button>
        </form>
        
        <Button 
          variant="outline" 
          onClick={getCurrentLocation}
          disabled={isLocating}
          className="w-full mb-2"
        >
          <MapPin size={16} className="mr-2" />
          {isLocating ? 'Getting location...' : 'Use My Current Location'}
        </Button>
        
        <div ref={mapContainer} className="w-full rounded-lg" style={{ height }} />
      </div>
      <div className="mt-2 text-sm flex items-center text-muted-foreground">
        <MapPin size={14} className="mr-1" />
        <span>Click on the map or drag the marker to set the location</span>
      </div>
      <div className="mt-1 text-xs text-muted-foreground">
        Coordinates: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
      </div>
    </div>
  );
};

export default LocationPicker;
