
import React, { useState } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import { PropertyData } from '@/components/PropertyCard';
import { useMapbox } from '@/hooks/useMapbox';
import MapControls from './MapControls';
import PropertyInfoPanel from './PropertyInfoPanel';
import PropertyMarker from './PropertyMarker';
import UserLocationMarker from './UserLocationMarker';

interface PropertyMapViewProps {
  properties: PropertyData[];
  userLocation?: { lat: number; lng: number } | null;
  onClose?: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  showAllPropertiesOnLoad?: boolean;
}

const PropertyMapView: React.FC<PropertyMapViewProps> = ({
  properties,
  userLocation,
  onClose,
  isFullscreen = false,
  onToggleFullscreen,
  showAllPropertiesOnLoad = false,
}) => {
  const [selectedProperty, setSelectedProperty] = useState<PropertyData | null>(null);
  
  const {
    mapContainer,
    map,
    mapInitialized,
    mapStyle,
    changeMapStyle,
    getUserLocation,
    fitMapToProperties
  } = useMapbox(properties, userLocation, showAllPropertiesOnLoad);

  // Handle property marker click
  const handlePropertyClick = (property: PropertyData) => {
    setSelectedProperty(property);
  };

  // Resize map when fullscreen changes
  React.useEffect(() => {
    if (map && mapInitialized) {
      // Trigger a resize event to ensure the map fills its container
      setTimeout(() => {
        try {
          map.resize();
          console.log("Map resized after fullscreen toggle");
        } catch (error) {
          console.error("Error resizing map:", error);
        }
      }, 100);
    }
  }, [isFullscreen, mapInitialized, map]);

  return (
    <div className={`bg-white rounded-lg overflow-hidden shadow-md flex flex-col ${isFullscreen ? 'fixed inset-0 z-50' : 'relative'}`}>
      {/* Map Controls */}
      <MapControls 
        propertiesCount={properties.filter(p => p.latitude && p.longitude).length}
        mapStyle={mapStyle}
        isFullscreen={isFullscreen}
        onStyleChange={changeMapStyle}
        onFitMapToProperties={fitMapToProperties}
        onGetUserLocation={getUserLocation}
        onToggleFullscreen={onToggleFullscreen}
        onClose={onClose}
      />
      
      {/* Map container */}
      <div className="relative flex-grow">
        <div ref={mapContainer} className="w-full h-full" />
        
        {/* Render property markers */}
        {mapInitialized && map && (
          <>
            {properties.map(property => (
              property.latitude && property.longitude ? (
                <PropertyMarker
                  key={property.id}
                  map={map}
                  property={property}
                  onClick={handlePropertyClick}
                />
              ) : null
            ))}
            
            {/* Render user location marker if available */}
            {userLocation && (
              <UserLocationMarker
                map={map}
                userLocation={userLocation}
              />
            )}
          </>
        )}
        
        {/* Property info panel - show when property is selected */}
        {selectedProperty && (
          <PropertyInfoPanel 
            property={selectedProperty} 
            onClose={() => setSelectedProperty(null)} 
          />
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
