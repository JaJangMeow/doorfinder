
import { useState, useEffect, useRef } from 'react';

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

// Single property location props for PropertyLocation component
interface PropertyLocationProps {
  latitude: number;
  longitude: number;
  googleMapsLoaded: boolean;
}

const useGoogleMap = (props: UseGoogleMapProps | PropertyLocationProps) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    : props.userLocation || { lat: 0, lng: 0 };
  
  const properties = isSingleProperty 
    ? [] // Empty array for single property view
    : props.properties;

  const googleMapsLoaded = isSingleProperty 
    ? props.googleMapsLoaded 
    : true; // Assume loaded for regular property listing

  useEffect(() => {
    const loadMap = async () => {
      if (!mapRef.current) return;
      
      try {
        const google = window.google;
        const mapOptions: google.maps.MapOptions = {
          center: location,
          zoom: location.lat !== 0 || location.lng !== 0 ? 15 : 2,
          mapTypeId: 'roadmap',
        };

        const newMap = new google.maps.Map(mapRef.current, mapOptions);
        setMap(newMap);
        setIsReady(true);
        setError(null);

        // If we're dealing with a single property, add a marker for it
        if (isSingleProperty && location.lat !== 0 && location.lng !== 0) {
          new google.maps.Marker({
            position: location,
            map: newMap,
            animation: google.maps.Animation.DROP,
          });
        }
      } catch (err) {
        console.error('Error initializing map:', err);
        setError('Failed to initialize Google Maps');
        setIsReady(false);
      }
    };

    if (window.google && googleMapsLoaded) {
      loadMap();
    } else if (googleMapsLoaded) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = loadMap;
      script.onerror = () => {
        setError('Failed to load Google Maps API');
        setIsReady(false);
      };
      document.head.appendChild(script);
    }
  }, [location, isSingleProperty, googleMapsLoaded]);

  useEffect(() => {
    if (!map || properties.length === 0) return;

    const google = window.google;

    const createMarker = (property: Property) => {
      const propertyLatLng = { 
        lat: property.latitude, 
        lng: property.longitude 
      };

      const marker = new google.maps.Marker({
        position: propertyLatLng,
        map: map,
        title: property.title,
      });

      const contentString = `
        <div style="display: flex; flex-direction: column; align-items: flex-start; width: 250px;">
          <img src="${property.imageUrl}" alt="${property.title}" style="width: 100%; height: auto; margin-bottom: 8px;">
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
      
      return marker;
    };

    const bounds = new google.maps.LatLngBounds();
    properties.forEach(property => {
      if (property.latitude && property.longitude) {
        const marker = createMarker(property);
        bounds.extend({ 
          lat: property.latitude, 
          lng: property.longitude 
        });
      }
    });

    if (properties.length > 0) {
      map.fitBounds(bounds);
    }
  }, [map, properties]);

  // Function to add nearby places to the map
  const addNearbyPlaces = () => {
    if (!map || !isReady) return;
    
    try {
      const google = window.google;
      const service = new google.maps.places.PlacesService(map);
      
      const center = map.getCenter();
      if (!center) return;

      const searchTypes = ['restaurant', 'school', 'transit_station'];
      
      searchTypes.forEach(type => {
        service.nearbySearch(
          {
            location: center,
            radius: 1000, // 1km radius
            type: type
          },
          (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && results) {
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
              
              // Add markers for these places
              newPlaces.forEach(place => {
                let icon;
                
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
                
                new google.maps.Marker({
                  position: place.position,
                  map: map,
                  icon: icon,
                  title: place.name,
                });
              });
            }
          }
        );
      });
    } catch (err) {
      console.error('Error finding nearby places:', err);
    }
  };

  // Function to retry map initialization
  const retryMapInitialization = () => {
    setError(null);
    
    if (window.google) {
      // If Google Maps API is already loaded, try initializing the map again
      setIsReady(false);
      
      setTimeout(() => {
        if (!mapRef.current) return;
        
        try {
          const google = window.google;
          const mapOptions: google.maps.MapOptions = {
            center: location,
            zoom: location.lat !== 0 || location.lng !== 0 ? 15 : 2,
            mapTypeId: 'roadmap',
          };

          const newMap = new google.maps.Map(mapRef.current, mapOptions);
          setMap(newMap);
          setIsReady(true);
        } catch (err) {
          console.error('Error retrying map initialization:', err);
          setError('Failed to initialize Google Maps');
        }
      }, 100);
    } else {
      // If Google Maps API is not loaded, reload the script
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (!mapRef.current) return;
        
        try {
          const google = window.google;
          const mapOptions: google.maps.MapOptions = {
            center: location,
            zoom: location.lat !== 0 || location.lng !== 0 ? 15 : 2,
            mapTypeId: 'roadmap',
          };

          const newMap = new google.maps.Map(mapRef.current, mapOptions);
          setMap(newMap);
          setIsReady(true);
        } catch (err) {
          console.error('Error initializing map after script reload:', err);
          setError('Failed to initialize Google Maps');
        }
      };
      script.onerror = () => {
        setError('Failed to load Google Maps API');
      };
      document.head.appendChild(script);
    }
  };

  return { 
    mapRef, 
    isReady, 
    error, 
    retryMapInitialization, 
    addNearbyPlaces 
  };
};

export default useGoogleMap;
