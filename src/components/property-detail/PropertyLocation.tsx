
import React from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { MapPin, ExternalLink } from 'lucide-react';
import GoogleMap from '@/components/GoogleMap';

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
  
  const hasValidCoordinates = 
    latitude !== undefined && 
    longitude !== undefined && 
    !isNaN(Number(latitude)) && 
    !isNaN(Number(longitude)) &&
    Number(latitude) !== 0 &&
    Number(longitude) !== 0;

  const handleOpenGoogleMaps = () => {
    // If we have coordinates, use them; otherwise, use the address
    const mapsUrl = hasValidCoordinates
      ? `https://www.google.com/maps?q=${latitude},${longitude}`
      : `https://www.google.com/maps/search/${encodeURIComponent(address)}`;
    
    window.open(mapsUrl, '_blank');
  };

  const handleCopyLocation = () => {
    if (hasValidCoordinates) {
      navigator.clipboard.writeText(`${latitude},${longitude}`);
      toast({
        title: "Coordinates copied",
        description: "Location coordinates have been copied to clipboard.",
      });
    } else {
      navigator.clipboard.writeText(address);
      toast({
        title: "Address copied",
        description: "Property address has been copied to clipboard.",
      });
    }
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
            variant="outline" 
            size="sm"
            onClick={handleCopyLocation}
          >
            Copy Location
          </Button>
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
        <div className="rounded-xl overflow-hidden">
          <GoogleMap latitude={Number(latitude)} longitude={Number(longitude)} />
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
