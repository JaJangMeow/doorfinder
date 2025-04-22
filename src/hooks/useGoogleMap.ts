
import { useState, useEffect, useRef, useCallback } from 'react';

// Single property location props for PropertyLocation component
interface PropertyLocationProps {
  latitude: number;
  longitude: number;
  googleMapsLoaded: boolean;
}

interface Property {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  address: string;
  imageUrl: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  availableFrom: string;
  hasHall?: boolean;
  hasSeparateKitchen?: boolean;
}

interface UseGoogleMapProps {
  properties: Property[];
  userLocation: { lat: number; lng: number } | null;
}

type GoogleMapProps = UseGoogleMapProps | PropertyLocationProps;

const useGoogleMap = (props: GoogleMapProps) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const markers = useRef<google.maps.Marker[]>([]);
  
  // For handling nearby places
  const [nearbyPlaces, setNearbyPlaces] = useState<Array<{
    name: string;
    position: { lat: number; lng: number };
    icon?: string;
    type: string;
  }>>([]);

  // Check if we're dealing with a single property or multiple properties
  const isSingleProperty = 'latitude' in props && 'longitude' in props;
  
  // Extract the necessary location values based on the props type
  const location = isSingleProperty 
    ? { lat: props.latitude, lng: props.longitude }
    : (props.userLocation || { lat: 0, lng: 0 });
  
  const properties = isSingleProperty 
    ? [] // Empty array for single property view
    : props.properties;

  const googleMapsLoaded = isSingleProperty 
    ? props.googleMapsLoaded 
    : true; // Assume loaded for regular property listing

  // Initialize map
  useEffect(() => {
    // Clean up function to remove previous map and markers
    const cleanUp = () => {
      if (markers.current) {
        markers.current.forEach(marker => marker.setMap(null));
        markers.current = [];
      }
      
      if (map) {
        // No direct remove method for google maps
        setMap(null);
      }
    };

    // Skip initialization if Google Maps is not loaded or mapRef is not ready
    if (!googleMapsLoaded || !mapRef.current || !window.google || !window.google.maps) {
      return cleanUp;
    }
    
    try {
      console.log("Initializing Google Map with location:", location);
      
      // Create map instance
      const mapOptions: google.maps.MapOptions = {
        center: location,
        zoom: (location.lat !== 0 || location.lng !== 0) ? 15 : 2,
        mapTypeControl: true,
        streetViewControl: true,
        zoomControl: true,
        fullscreenControl: false,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };

      const newMap = new google.maps.Map(mapRef.current, mapOptions);
      setMap(newMap);
      setIsReady(true);
      setError(null);

      // Add marker for single property view
      if (isSingleProperty && location.lat !== 0 && location.lng !== 0) {
        const marker = new google.maps.Marker({
          position: location,
          map: newMap,
          animation: google.maps.Animation.DROP,
        });
        
        markers.current.push(marker);
      }
      
      return cleanUp;
    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Failed to initialize Google Maps');
      setIsReady(false);
      return cleanUp;
    }
  }, [location, isSingleProperty, googleMapsLoaded]);

  // Add markers for multiple properties
  useEffect(() => {
    if (!map || properties.length === 0 || !window.google || !window.google.maps) return;
    
    // Clear existing markers
    markers.current.forEach(marker => marker.setMap(null));
    markers.current = [];

    const bounds = new google.maps.LatLngBounds();
    
    // Add markers for each property
    properties.forEach(property => {
      if (!property.latitude || !property.longitude) return;
      
      const propertyLatLng = { 
        lat: property.latitude, 
        lng: property.longitude 
      };

      const marker = new google.maps.Marker({
        position: propertyLatLng,
        map: map,
        title: property.title,
      });
      
      markers.current.push(marker);

      // Create info window content
      const contentString = `
        <div style="display: flex; flex-direction: column; align-items: flex-start; width: 250px;">
          <h3 style="font-size: 1.2em; margin-bottom: 4px;">${property.title}</h3>
          <p style="font-size: 1em; margin-bottom: 4px;">${property.address}</p>
          <p style="font-size: 1.1em; font-weight: bold; margin-bottom: 8px;">₹${property.price}/month</p>
          <div style="display: flex; justify-content: space-between; width: 100%; margin-bottom: 8px;">
            <span>Bedrooms: ${property.bedrooms}</span>
            <span>Bathrooms: ${property.bathrooms}</span>
          </div>
          <a href="/property/${property.id}" style="color: #007bff; text-decoration: none;">View Details</a>
        </div>
      `;

      const infoWindow = new google.maps.InfoWindow({
        content: contentString
      });
      
      marker.addListener("click", () => {
        infoWindow.open({
          anchor: marker,
          map
        });
      });
      
      bounds.extend(propertyLatLng);
    });

    // Fit map to bounds if there are properties
    if (properties.length > 0) {
      map.fitBounds(bounds);
    }
  }, [map, properties]);

  // Add nearby places to the map
  const addNearbyPlaces = useCallback(() => {
    if (!map || !isReady || !window.google || !window.google.maps || !window.google.maps.places) {
      console.error("Cannot add nearby places: Map not ready or Places library not loaded");
      return;
    }
    
    console.log("Adding nearby places to map");
    
    try {
      const service = new google.maps.places.PlacesService(map);
      const center = map.getCenter();
      
      if (!center) {
        console.error("Cannot get map center");
        return;
      }

      const searchTypes = ['restaurant', 'school', 'transit_station'];
      let processedPlaces = 0;
      
      // Clear existing nearby place markers
      markers.current = markers.current.filter(marker => {
        if (marker.getTitle()?.startsWith('nearby-')) {
          marker.setMap(null);
          return false;
        }
        return true;
      });
      
      setNearbyPlaces([]);
      
      // Search for nearby places by type
      searchTypes.forEach(type => {
        service.nearbySearch(
          {
            location: center,
            radius: 1000, // 1km radius
            type: type
          },
          (results, status) => {
            processedPlaces++;
            
            if (status === google.maps.places.PlacesServiceStatus.OK && results) {
              console.log(`Found ${results.length} nearby ${type}s`);
              
              const newPlaces = results.slice(0, 5).map(place => ({
                name: place.name || 'Unnamed Place',
                position: {
                  lat: place.geometry?.location.lat() || 0,
                  lng: place.geometry?.location.lng() || 0
                },
                icon: place.icon,
                type: type
              }));
              
              // Add markers for these places
              newPlaces.forEach(place => {
                let icon;
                
                // Different icons for different place types
                switch (type) {
                  case 'restaurant':
                    icon = {
                      url: place.icon || 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                      scaledSize: new google.maps.Size(24, 24)
                    };
                    break;
                  case 'school':
                    icon = {
                      url: place.icon || 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
                      scaledSize: new google.maps.Size(24, 24)
                    };
                    break;
                  case 'transit_station':
                    icon = {
                      url: place.icon || 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
                      scaledSize: new google.maps.Size(24, 24)
                    };
                    break;
                  default:
                    icon = {
                      url: place.icon || 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                      scaledSize: new google.maps.Size(24, 24)
                    };
                }
                
                // Create marker for this place
                const placeMarker = new google.maps.Marker({
                  position: place.position,
                  map: map,
                  icon: icon,
                  title: `nearby-${place.name}`, // Prefix to identify nearby place markers
                });
                
                markers.current.push(placeMarker);
                
                // Add info window with place details
                const infoContent = `
                  <div style="padding: 8px;">
                    <strong>${place.name}</strong><br/>
                    <span>${type.replace('_', ' ')}</span>
                  </div>
                `;
                
                const infoWindow = new google.maps.InfoWindow({
                  content: infoContent
                });
                
                placeMarker.addListener('click', () => {
                  infoWindow.open({
                    anchor: placeMarker,
                    map
                  });
                });
              });
              
              // Update state with new places
              setNearbyPlaces(prev => [...prev, ...newPlaces]);
            } else {
              console.warn(`No ${type}s found or error: ${status}`);
            }
          }
        );
      });
    } catch (err) {
      console.error('Error finding nearby places:', err);
    }
  }, [map, isReady]);

  // Retry map initialization if it fails
  const retryMapInitialization = useCallback(() => {
    console.log("Retrying map initialization");
    setError(null);
    
    if (!mapRef.current) {
      console.error("Map container ref is not available");
      return;
    }
    
    // If Google Maps API is loaded, initialize map
    if (window.google && window.google.maps) {
      try {
        const mapOptions: google.maps.MapOptions = {
          center: location,
          zoom: (location.lat !== 0 || location.lng !== 0) ? 15 : 2,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
        };

        // Clean up existing map and markers
        markers.current.forEach(marker => marker.setMap(null));
        markers.current = [];
        
        const newMap = new google.maps.Map(mapRef.current, mapOptions);
        setMap(newMap);
        setIsReady(true);
        
        // Add marker for single property
        if (isSingleProperty && location.lat !== 0 && location.lng !== 0) {
          const marker = new google.maps.Marker({
            position: location,
            map: newMap,
            animation: google.maps.Animation.DROP,
          });
          
          markers.current.push(marker);
        }
      } catch (err) {
        console.error('Error retrying map initialization:', err);
        setError('Failed to initialize Google Maps');
      }
    }
  }, [location, isSingleProperty]);

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

export default useGoogleMap;
