
import React from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

interface StreetViewTabContentProps {
  latitude: number;
  longitude: number;
  onOpenStreetView: () => void;
}

const StreetViewTabContent: React.FC<StreetViewTabContentProps> = ({
  latitude,
  longitude,
  onOpenStreetView
}) => {
  return (
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
          onClick={onOpenStreetView}
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          Open Street View
        </Button>
      </div>
    </div>
  );
};

export default StreetViewTabContent;
