
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Map, Compass, Navigation } from 'lucide-react';
import { useGoogleMapsScript } from '@/hooks/useGoogleMapsScript';
import useGoogleMap from '@/hooks/useGoogleMap';
import MapHeader from './MapHeader';
import MapTabContent from './MapTabContent';
import SatelliteTabContent from './SatelliteTabContent';
import StreetViewTabContent from './StreetViewTabContent';
import NoLocationState from './NoLocationState';
import LocationFooter from './LocationFooter';

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
  const { loaded: googleMapsLoaded, error: scriptError } = useGoogleMapsScript();
  const [activeTab, setActiveTab] = useState<string>('map');
  const [showNearbyPlaces, setShowNearbyPlaces] = useState(false);
  
  const hasValidCoordinates = 
    latitude !== undefined && 
    longitude !== undefined && 
    !isNaN(Number(latitude)) && 
    !isNaN(Number(longitude)) &&
    Number(latitude) !== 0 &&
    Number(longitude) !== 0;

  useEffect(() => {
    if (scriptError) {
      toast({
        title: "Maps API Error",
        description: "Could not load Google Maps. Please try again later.",
        variant: "destructive"
      });
    }
  }, [scriptError, toast]);

  // Only proceed with map initialization if coordinates are valid and Google Maps is loaded
  const { 
    mapRef, 
    isReady, 
    error: mapError, 
    retryMapInitialization,
    addNearbyPlaces
  } = useGoogleMap({
    latitude: hasValidCoordinates ? Number(latitude) : 0, 
    longitude: hasValidCoordinates ? Number(longitude) : 0, 
    googleMapsLoaded
  });

  useEffect(() => {
    console.log("Map state:", { 
      hasValidCoordinates, 
      googleMapsLoaded, 
      isReady, 
      mapError,
      latitude,
      longitude
    });
  }, [hasValidCoordinates, googleMapsLoaded, isReady, mapError, latitude, longitude]);

  const handleOpenGoogleMaps = () => {
    const mapsUrl = hasValidCoordinates
      ? `https://www.google.com/maps?q=${latitude},${longitude}`
      : `https://www.google.com/maps/search/${encodeURIComponent(address)}`;
    
    window.open(mapsUrl, '_blank');
  };

  const handleOpenGoogleStreetView = () => {
    if (!hasValidCoordinates) return;
    
    const streetViewUrl = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${latitude},${longitude}`;
    window.open(streetViewUrl, '_blank');
  };

  const handleShowNearbyPlaces = () => {
    setShowNearbyPlaces(true);
    addNearbyPlaces();
    
    toast({
      title: "Showing nearby places",
      description: "Displaying restaurants, schools, and transit stations near this property",
    });
  };

  return (
    <div className="mt-8">
      <MapHeader onOpenGoogleMaps={handleOpenGoogleMaps} />
      
      {hasValidCoordinates ? (
        <Card className="overflow-hidden">
          <Tabs defaultValue="map" value={activeTab} onValueChange={setActiveTab}>
            <div className="border-b p-2 bg-muted/20">
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="map" className="flex items-center gap-1.5">
                  <Map size={14} />
                  <span>Map</span>
                </TabsTrigger>
                <TabsTrigger value="satellite" className="flex items-center gap-1.5">
                  <Compass size={14} />
                  <span>Satellite</span>
                </TabsTrigger>
                <TabsTrigger value="streetview" className="flex items-center gap-1.5">
                  <Navigation size={14} />
                  <span>Street View</span>
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="map" className="m-0">
              <MapTabContent 
                mapRef={mapRef}
                isReady={isReady && googleMapsLoaded}
                error={!!mapError || scriptError}
                retryMapInitialization={retryMapInitialization}
                showNearbyPlaces={showNearbyPlaces}
                onShowNearbyPlaces={handleShowNearbyPlaces}
                onOpenGoogleMaps={handleOpenGoogleMaps}
              />
            </TabsContent>
            
            <TabsContent value="satellite" className="m-0">
              <SatelliteTabContent 
                latitude={Number(latitude)} 
                longitude={Number(longitude)} 
              />
            </TabsContent>
            
            <TabsContent value="streetview" className="m-0">
              <StreetViewTabContent 
                latitude={Number(latitude)} 
                longitude={Number(longitude)}
                onOpenStreetView={handleOpenGoogleStreetView}
              />
            </TabsContent>
          </Tabs>
        </Card>
      ) : (
        <NoLocationState onSearchAddress={handleOpenGoogleMaps} />
      )}
      
      <LocationFooter 
        address={address} 
        coordinates={hasValidCoordinates ? { latitude: Number(latitude), longitude: Number(longitude) } : undefined} 
      />
    </div>
  );
};

export { PropertyLocation };
