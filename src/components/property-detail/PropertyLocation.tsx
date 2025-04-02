
import React, { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { MapPin, ExternalLink, Navigation, Compass, Info, Home, Building, Coffee } from 'lucide-react';
import { useGoogleMapsScript } from '@/hooks/useGoogleMapsScript';
import { useGoogleMap } from '@/hooks/useGoogleMap';

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
  const { loaded: googleMapsLoaded, error: mapsScriptError } = useGoogleMapsScript();
  const [activeTab, setActiveTab] = useState<string>('map');
  const [showNearbyPlaces, setShowNearbyPlaces] = useState(false);
  
  const hasValidCoordinates = 
    latitude !== undefined && 
    longitude !== undefined && 
    !isNaN(Number(latitude)) && 
    !isNaN(Number(longitude)) &&
    Number(latitude) !== 0 &&
    Number(longitude) !== 0;

  const { 
    mapRef, 
    isReady, 
    error,
    retryMapInitialization,
    addNearbyPlaces
  } = useGoogleMap({
    latitude: hasValidCoordinates ? Number(latitude) : 0, 
    longitude: hasValidCoordinates ? Number(longitude) : 0, 
    googleMapsLoaded
  });

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
              <div className="h-[400px] relative">
                <div ref={mapRef} className="w-full h-full" />
                {!isReady && !error && (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                  </div>
                )}
                {error && (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
                    <div className="text-center p-4">
                      <p className="text-muted-foreground mb-2">Failed to load map</p>
                      <Button onClick={retryMapInitialization}>
                        Retry
                      </Button>
                    </div>
                  </div>
                )}
                <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                  {isReady && !showNearbyPlaces && (
                    <Button 
                      size="sm"
                      variant="secondary"
                      className="shadow-md"
                      onClick={handleShowNearbyPlaces}
                    >
                      <Coffee className="mr-2 h-4 w-4" />
                      Show Nearby Places
                    </Button>
                  )}
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
            </TabsContent>
            
            <TabsContent value="satellite" className="m-0">
              <div className="h-[400px] relative">
                <iframe 
                  title="Satellite View"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  style={{ border: 0 }}
                  src={`https://www.google.com/maps/embed/v1/view?key=AIzaSyCqG_rXoFfwIRg8eoCV_joDHYk8ZrkpOsg&center=${latitude},${longitude}&zoom=18&maptype=satellite`}
                  allowFullScreen
                />
              </div>
            </TabsContent>
            
            <TabsContent value="streetview" className="m-0">
              <div className="h-[400px] relative">
                <iframe 
                  title="Street View"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  style={{ border: 0 }}
                  src={`https://www.google.com/maps/embed/v1/streetview?key=AIzaSyCqG_rXoFfwIRg8eoCV_joDHYk8ZrkpOsg&location=${latitude},${longitude}&heading=210&pitch=10&fov=90`}
                  allowFullScreen
                />
                <div className="absolute bottom-4 right-4">
                  <Button 
                    size="sm"
                    variant="secondary"
                    className="shadow-md"
                    onClick={handleOpenGoogleStreetView}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open Street View
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
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
