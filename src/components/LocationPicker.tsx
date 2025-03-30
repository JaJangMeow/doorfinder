import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Search, ExternalLink, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { GOOGLE_MAPS_API_KEY } from '@/lib/supabase';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';

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
  value?: string;
  onChange: (location: string, lat?: number, lng?: number) => void;
  placeholder?: string;
  error?: boolean;
  setSelectedLocation?: (location: { lat: number; lng: number; address: string } | null) => void;
}

interface PredictionResult {
  description: string;
  place_id: string;
}

interface GooglePlaceResult {
  geometry?: {
    location?: {
      lat: () => number;
      lng: () => number;
    };
  };
  formatted_address?: string;
}

declare global {
  interface Window {
    google: {
      maps: {
        places: {
          AutocompleteService: new () => {
            getPlacePredictions: (
              request: { input: string; componentRestrictions?: { country: string } },
              callback: (predictions: PredictionResult[] | null) => void
            ) => void;
          };
          PlacesService: new (element: HTMLDivElement) => {
            getDetails: (
              request: { placeId: string; fields: string[] },
              callback: (result: GooglePlaceResult | null, status: string) => void
            ) => void;
          };
        };
      };
    };
  }
}

const LocationPicker: React.FC<LocationPickerProps> = ({ 
  onLocationSelect, 
  defaultLocation = { lat: 12.9716, lng: 77.5946 }, // Default to Bangalore coordinates
  className,
  height = '300px',
  zoom = 12,
  value = '',
  onChange,
  placeholder = 'Enter a location',
  error = false,
  setSelectedLocation,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [coordinates, setCoordinates] = useState<Coordinates>(defaultLocation);
  const [isLocating, setIsLocating] = useState(false);
  const [searchQuery, setSearchQuery] = useState(value);
  const [isSearching, setIsSearching] = useState(false);
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const placesServiceRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useOnClickOutside(containerRef, () => setShowPredictions(false));

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
  }, [onLocationSelect, zoom, coordinates.lat, coordinates.lng]);

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

  const openInGoogleMaps = () => {
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lng}`;
    window.open(googleMapsUrl, '_blank');
  };

  // Initialize Google Places service
  useEffect(() => {
    if (!placesServiceRef.current) {
      placesServiceRef.current = document.createElement('div');
    }
  }, []);

  const fetchPredictions = useCallback((input: string) => {
    if (!input || input.length < 3 || !window.google?.maps?.places) {
      setPredictions([]);
      return;
    }

    setLoading(true);
    const autocompleteService = new window.google.maps.places.AutocompleteService();
    
    autocompleteService.getPlacePredictions(
      {
        input,
        componentRestrictions: { country: 'uk' },
      },
      (results) => {
        setLoading(false);
        if (results) {
          setPredictions(results);
          setShowPredictions(true);
        } else {
          setPredictions([]);
        }
      }
    );
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    fetchPredictions(value);
  }, [fetchPredictions]);

  const handleSelectPrediction = useCallback((prediction: PredictionResult) => {
    setSearchQuery(prediction.description);
    setShowPredictions(false);
    onChange(prediction.description);
    
    // Get place details to extract lat lng
    if (window.google?.maps?.places && placesServiceRef.current) {
      const placesService = new window.google.maps.places.PlacesService(placesServiceRef.current);
      
      placesService.getDetails(
        {
          placeId: prediction.place_id,
          fields: ['geometry', 'formatted_address'],
        },
        (result, status) => {
          if (status === 'OK' && result && result.geometry && result.geometry.location) {
            const lat = result.geometry.location.lat();
            const lng = result.geometry.location.lng();
            onChange(prediction.description, lat, lng);
            
            if (setSelectedLocation) {
              setSelectedLocation({
                lat,
                lng,
                address: prediction.description,
              });
            }
          } else {
            toast({
              title: 'Error',
              description: 'Could not get location details',
              variant: 'destructive',
            });
          }
        }
      );
    }
  }, [onChange, setSelectedLocation, toast]);

  return (
    <div className={`${className || ''}`}>
      <div className="glass mb-2">
        <form onSubmit={handleSearch} className="flex gap-2 mb-2">
          <Input
            placeholder={placeholder}
            value={searchQuery}
            onChange={handleInputChange}
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
        
        <Button
          variant="outline"
          onClick={openInGoogleMaps}
          className="w-full mt-2 text-blue-600"
        >
          <ExternalLink size={16} className="mr-2" />
          Open in Google Maps
        </Button>
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
