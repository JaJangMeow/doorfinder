import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { PropertyData } from '@/components/PropertyCard';
import { Button } from '@/components/ui/button';
import { MapPin, Maximize2, Minimize2, Home, X, Info } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Link } from 'react-router-dom';

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

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Initialize Mapbox with token
    mapboxgl.accessToken = 'pk.eyJ1IjoiMjRtc2NzMTAiLCJhIjoiY204MnhzajRxMWt2aTJycTh2ZHc0aWZldCJ9.DnpQkiPBocF3mh-5VM77KA';
    
    try {
      // Default location (center of the provided properties, or London if no properties)
      let defaultCenter: [number, number] = [-0.118092, 51.509865]; // London
      
      // Calculate the center of the properties if any have coordinates
      const validProperties = properties.filter(p => p.latitude && p.longitude);
      if (validProperties.length > 0) {
        const totalLat = validProperties.reduce((sum, p) => sum + (p.latitude || 0), 0);
        const totalLng = validProperties.reduce((sum, p) => sum + (p.longitude || 0), 0);
        defaultCenter = [totalLng / validProperties.length, totalLat / validProperties.length];
      } else if (userLocation) {
        defaultCenter = [userLocation.lng, userLocation.lat];
      }

      const initializedMap = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: defaultCenter,
        zoom: 12
      });
      
      map.current = initializedMap;

      // Add navigation controls
      initializedMap.addControl(new mapboxgl.NavigationControl(), 'top-right');

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
  }, [properties, toast]);

  // Add markers for properties
  useEffect(() => {
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
        markerEl.innerHTML = `<div class="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-lg">
          <span class="text-xs font-bold">₹${property.price}</span>
        </div>`;
        
        // Create and add marker
        const marker = new mapboxgl.Marker({
          element: markerEl,
          anchor: 'bottom'
        })
        .setLngLat([property.longitude, property.latitude])
        .addTo(map.current);
        
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

  // Add user location marker
  useEffect(() => {
    if (!map.current || !mapInitialized || !userLocation) return;
    
    console.log("Adding user location marker:", userLocation);
    
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
          <div class="w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>
          <div class="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-75"></div>
        </div>
      `;
      
      // Create and add marker
      const marker = new mapboxgl.Marker({
        element: userMarkerEl,
        anchor: 'center'
      })
      .setLngLat([userLocation.lng, userLocation.lat])
      .addTo(map.current);
      
      userMarkerRef.current = marker;
      
      // Center map on user location
      map.current.flyTo({
        center: [userLocation.lng, userLocation.lat],
        zoom: 13,
        essential: true
      });

      console.log("User location marker added successfully");
    } catch (error) {
      console.error("Error adding user location marker:", error);
    }
  }, [userLocation, mapInitialized]);

  // Handle getting user's current location
  const handleGetUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLoc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          console.log("Got user's current location:", userLoc);
          
          // Create/update user marker
          if (map.current && mapInitialized) {
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
                  <div class="w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>
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
              
              // Center map on user location
              map.current.flyTo({
                center: [userLoc.lng, userLoc.lat],
                zoom: 13,
                essential: true
              });

              toast({
                title: "Location found",
                description: "We've updated the map to show your current location",
              });
            } catch (error) {
              console.error("Error updating user marker:", error);
              toast({
                title: "Marker Error",
                description: "Could not display your location on the map.",
                variant: "destructive",
              });
            }
          }
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
  };

  // Fit map to show all properties
  const handleFitMapToProperties = () => {
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
  };

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
      <div className="p-3 border-b flex items-center justify-between">
        <div className="flex items-center">
          <MapPin className="mr-2 text-primary" size={18} />
          <h3 className="font-medium">Property Map</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 px-2"
            onClick={handleFitMapToProperties}
          >
            <Home size={16} className="mr-1" />
            <span className="text-xs">Show All</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 px-2"
            onClick={handleGetUserLocation}
          >
            <MapPin size={16} className="mr-1" />
            <span className="text-xs">My Location</span>
          </Button>
          {onToggleFullscreen && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={onToggleFullscreen}
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </Button>
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
          <div className="absolute bottom-4 left-0 right-0 mx-auto w-11/12 max-w-sm bg-white rounded-lg shadow-lg p-4">
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
              <span className="font-semibold">₹{selectedProperty.price}</span>
              <span>{selectedProperty.bedrooms} {selectedProperty.bedrooms === 1 ? 'bedroom' : 'bedrooms'}</span>
              {selectedProperty.bathrooms && (
                <span>{selectedProperty.bathrooms} {selectedProperty.bathrooms === 1 ? 'bathroom' : 'bathrooms'}</span>
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
      
      {/* Footer with property count */}
      <div className="p-2 border-t bg-muted/30 text-xs text-center text-muted-foreground">
        Showing {properties.filter(p => p.latitude && p.longitude).length} properties on map
        {userLocation && <span className="ml-2">with your location</span>}
      </div>
    </div>
  );
};

export default PropertyMapView; 