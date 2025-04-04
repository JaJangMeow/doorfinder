
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Home, X, Navigation, Layers, Maximize2, Minimize2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface MapControlsProps {
  propertiesCount: number;
  mapStyle: 'streets' | 'satellite' | 'light';
  isFullscreen: boolean;
  onStyleChange: () => void;
  onFitMapToProperties: () => void;
  onGetUserLocation: () => void;
  onToggleFullscreen?: () => void;
  onClose?: () => void;
}

const MapControls: React.FC<MapControlsProps> = ({
  propertiesCount,
  mapStyle,
  isFullscreen,
  onStyleChange,
  onFitMapToProperties,
  onGetUserLocation,
  onToggleFullscreen,
  onClose,
}) => {
  return (
    <div className="p-3 border-b flex items-center justify-between bg-white">
      <div className="flex items-center">
        <MapPin className="mr-2 text-primary" size={18} />
        <h3 className="font-medium">Property Map</h3>
        <Badge className="ml-2 bg-primary/20 text-primary hover:bg-primary/30 border-0">
          {propertiesCount} Properties
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
                onClick={onFitMapToProperties}
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
                onClick={onGetUserLocation}
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
                onClick={onStyleChange}
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
  );
};

export default MapControls;
