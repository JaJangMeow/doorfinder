
import React from 'react';
import { MapPin, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MapHeaderProps {
  onOpenGoogleMaps: () => void;
}

const MapHeader: React.FC<MapHeaderProps> = ({ onOpenGoogleMaps }) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold text-gray-900 flex items-center">
        <MapPin className="mr-2 text-primary" size={20} />
        Location
      </h2>
      <div className="flex gap-2">
        <Button 
          variant="default" 
          size="sm"
          onClick={onOpenGoogleMaps}
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          Open in Google Maps
        </Button>
      </div>
    </div>
  );
};

export default MapHeader;
