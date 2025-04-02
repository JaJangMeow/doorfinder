
import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { PropertyData } from '@/components/PropertyCard';
import { Button } from '@/components/ui/button';
import { MapPin, Maximize2, Minimize2, Home, X, Info, Layers, Navigation } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface PropertyMapViewProps {
  properties: PropertyData[];
  userLocation?: { lat: number; lng: number } | null;
  onClose?: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

const PropertyMapView: React.FC<PropertyMapViewProps> = ({
  properties,
  userLocation,
  onClose,
  isFullscreen = false,
  onToggleFullscreen,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<PropertyData | null>(null);
  const { toast } = useToast();
  const [mapInitialized, setMapInitialized] = useState(false);
  const [mapStyle, setMapStyle] = useState<'streets' | 'satellite' | 'light'>('streets');

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

  // Initialize map with current style
  const initializeMap = useCallback(() => {
    if (!mapContainer.current || map.current) return;

    try {
      mapboxgl.accessToken = 'pk.eyJ1IjoiMjRtc2NzMTAiLCJhIjoiY204MnhzajRxMWt2aTJycTh2ZHc0aWZldCJ9.DnpQkiPBocF3mh-5VM77KA';
      
      const mapStyle = {
        streets: 'mapbox://styles/mapbox/streets-v11',
        satellite: 'mapbox://styles/mapbox/satellite-streets-v11',
        light: 'mapbox://styles/mapbox/light-v10'
      };
      
      const initializedMap = new mapboxgl.Map({
        container: mapContainer.current,
        style: mapStyle.streets,
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

      // Initialize popup
      popupRef.current = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        maxWidth: '300px',
        offset: 25
      });

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

      // Clean up on unmount
      return () => {
        initializedMap.remove();
        map.current = null;
        setMapInitialized(false);
      };
    } catch (error) {
      console.error("Error initializing map:", error);
      toast({
        title: "Map Error",
        description: "There was a problem loading the map. Please try again.",
        variant: "destructive"
      });
    }
  }, [defaultCenter, properties, toast]);

  // Initialize map on mount
  useEffect(() => {
    initializeMap();
    
    return () => {
      // Clean up markers when component unmounts
      markersRef.current.forEach(marker => marker.remove());
      if (userMarkerRef.current) userMarkerRef.current.remove();
    };
  }, [initializeMap]);

  // Change map style when mapStyle state changes
  useEffect(() => {
    if (!map.current || !mapInitialized) return;
    
    const styles = {
      streets: 'mapbox://styles/mapbox/streets-v11',
      satellite: 'mapbox://styles/mapbox/satellite-streets-v11',
      light: 'mapbox://styles/mapbox/light-v10'
    };
    
    map.current.setStyle(styles[mapStyle]);
    
    // We need to recreate markers after style change
    map.current.once('styledata', () => {
      // Re-add the heatmap layer
      if (map.current?.getLayer('property-heat')) {
        map.current.removeLayer('property-heat');
      }
      
      if (map.current?.getSource('property-heat-source')) {
        map.current.removeSource('property-heat-source');
      }
      
      if (map.current) {
        map.current.addSource('property-heat-source', {
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
        });
        
        map.current.addLayer({
          id: 'property-heat',
          type: 'heatmap',
          source: 'property-heat-source',
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
      }
      
      // Re-add property markers
      addPropertyMarkers();
      
      // Re-add user location marker
      if (userLocation) {
        addUserLocationMarker(userLocation);
      }
    });
  }, [mapStyle, mapInitialized, properties, userLocation]);

  // Add markers for properties
  const addPropertyMarkers = useCallback(() => {
    if (!map.current || !mapInitialized) return;
    
    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    
    // Add markers for each property
    properties.forEach(property => {
      if (!property.latitude || !property.longitude) return;
      
      try {
        // Create marker element
        const markerEl = document.createElement('div');
        markerEl.className = 'property-marker';
        markerEl.innerHTML = `
          <div class="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-lg transform transition-transform hover:scale-110 cursor-pointer">
            <span class="text-xs font-bold">₹${property.price}</span>
          </div>
        `;
        
        // Create and add marker
        const marker = new mapboxgl.Marker({
          element: markerEl,
          anchor: 'bottom'
        })
        .setLngLat([property.longitude, property.latitude])
        .addTo(map.current!);
        
        // Add click event
        marker.getElement().addEventListener('click', () => {
          setSelectedProperty(property);
          if (popupRef.current && map.current) {
            const popupContent = `
              <div class="p-2">
                <h3 class="font-medium text-sm">${property.title}</h3>
                <p class="text-xs text-muted-foreground">${property.address}</p>
                <div class="flex items-center gap-2 mt-1">
                  <span class="text-xs bg-muted px-1 py-0.5 rounded">₹${property.price}</span>
                  <span class="text-xs">${property.bedrooms} beds</span>
                </div>
              </div>
            `;
            
            popupRef.current
              .setLngLat([property.longitude, property.latitude])
              .setHTML(popupContent)
              .addTo(map.current);
          }
        });
        
        // Store marker reference
        markersRef.current.push(marker);
      } catch (error) {
        console.error(`Error adding marker for property ${property.id}:`, error);
      }
    });
    
    console.log(`Added ${markersRef.current.length} property markers to map`);
  }, [properties, mapInitialized]);

  // Add property markers when properties or map initialization state changes
  useEffect(() => {
    addPropertyMarkers();
  }, [properties, mapInitialized, addPropertyMarkers]);

  // Add user location marker
  const addUserLocationMarker = useCallback((userLoc: { lat: number; lng: number }) => {
    if (!map.current || !mapInitialized) return;
    
    console.log("Adding user location marker:", userLoc);
    
    try {
      // Remove existing user marker
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
      
      // Create user location marker
      const userMarkerEl = document.createElement('div');
      userMarkerEl.className = 'user-location-marker';
      userMarkerEl.innerHTML = `
        <div class="relative">
          <div class="w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
            </svg>
          </div>
          <div class="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-75"></div>
        </div>
      `;
      
      // Create and add marker
      const marker = new mapboxgl.Marker({
        element: userMarkerEl,
        anchor: 'center'
      })
      .setLngLat([userLoc.lng, userLoc.lat])
      .addTo(map.current);
      
      userMarkerRef.current = marker;
      
      console.log("User location marker added successfully");
    } catch (error) {
      console.error("Error adding user location marker:", error);
    }
  }, [mapInitialized]);

  // Add user location marker when it changes
  useEffect(() => {
    if (userLocation) {
      addUserLocationMarker(userLocation);
    }
  }, [userLocation, mapInitialized, addUserLocationMarker]);

  // Handle getting user's current location
  const handleGetUserLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLoc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          console.log("Got user's current location:", userLoc);
          
          // Add/update user marker
          addUserLocationMarker(userLoc);
          
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
  }, [addUserLocationMarker, toast]);

  // Fit map to show all properties
  const handleFitMapToProperties = useCallback(() => {
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
    } catch (error) {
      console.error("Error fitting map to properties:", error);
    }
  }, [mapInitialized, properties, userLocation]);

  // Manage map size on fullscreen toggle
  useEffect(() => {
    if (map.current && mapInitialized) {
      // Trigger a resize event to ensure the map fills its container
      setTimeout(() => {
        try {
          map.current?.resize();
          console.log("Map resized after fullscreen toggle");
        } catch (error) {
          console.error("Error resizing map:", error);
        }
      }, 100);
    }
  }, [isFullscreen, mapInitialized]);

  return (
    <div className={`bg-white rounded-lg overflow-hidden shadow-md flex flex-col ${isFullscreen ? 'fixed inset-0 z-50' : 'relative'}`}>
      {/* Header */}
      <div className="p-3 border-b flex items-center justify-between bg-white">
        <div className="flex items-center">
          <MapPin className="mr-2 text-primary" size={18} />
          <h3 className="font-medium">Property Map</h3>
          <Badge className="ml-2 bg-primary/20 text-primary hover:bg-primary/30 border-0">
            {properties.filter(p => p.latitude && p.longitude).length} Properties
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 w-8 p-0"
                  onClick={handleFitMapToProperties}
                >
                  <Home size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Show all properties</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 w-8 p-0"
                  onClick={handleGetUserLocation}
                >
                  <Navigation size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">My location</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 w-8 p-0"
                  onClick={() => setMapStyle(currentStyle => {
                    const styles: Array<'streets' | 'satellite' | 'light'> = ['streets', 'satellite', 'light'];
                    const currentIndex = styles.indexOf(currentStyle);
                    const nextIndex = (currentIndex + 1) % styles.length;
                    return styles[nextIndex];
                  })}
                >
                  <Layers size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                Change map style ({mapStyle})
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {onToggleFullscreen && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={onToggleFullscreen}
                  >
                    {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  {isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          {onClose && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={onClose}
            >
              <X size={16} />
            </Button>
          )}
        </div>
      </div>
      
      {/* Map container */}
      <div className="relative flex-grow">
        <div ref={mapContainer} className="w-full h-full" />
        
        {/* Property info panel - show when property is selected */}
        {selectedProperty && (
          <div className="absolute bottom-4 left-0 right-0 mx-auto w-11/12 max-w-sm bg-white rounded-lg shadow-lg p-4 border border-border/50">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium">{selectedProperty.title}</h3>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 -mt-1 -mr-1"
                onClick={() => setSelectedProperty(null)}
              >
                <X size={14} />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mb-2">{selectedProperty.address}</p>
            <div className="flex items-center gap-4 mb-3 text-sm">
              <span className="font-semibold text-primary">₹{selectedProperty.price}</span>
              <span className="flex items-center">
                <Bed size={14} className="mr-1 opacity-70" />
                {selectedProperty.bedrooms} {selectedProperty.bedrooms === 1 ? 'bedroom' : 'bedrooms'}
              </span>
              {selectedProperty.bathrooms && (
                <span className="flex items-center">
                  <Bath size={14} className="mr-1 opacity-70" />
                  {selectedProperty.bathrooms} {selectedProperty.bathrooms === 1 ? 'bathroom' : 'bathrooms'}
                </span>
              )}
            </div>
            <Link to={`/property/${selectedProperty.id}`}>
              <Button className="w-full" variant="default" size="sm">
                <Info size={14} className="mr-1" />
                View Details
              </Button>
            </Link>
          </div>
        )}
      </div>
      
      {/* Footer with help text */}
      <div className="p-2 border-t bg-muted/30 text-xs text-center text-muted-foreground">
        Click on a marker to view property details • 
        {userLocation && <span> Your location is shown in blue • </span>}
        {mapStyle === 'streets' ? 'Street view' : mapStyle === 'satellite' ? 'Satellite view' : 'Light view'}
      </div>
    </div>
  );
};

export default PropertyMapView;
