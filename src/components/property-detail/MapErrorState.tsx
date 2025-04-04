
import React from 'react';
import { Button } from '@/components/ui/button';

interface MapErrorStateProps {
  onRetry: () => void;
  message?: string;
}

const MapErrorState: React.FC<MapErrorStateProps> = ({ 
  onRetry, 
  message = "Map coordinates not available" 
}) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
      <div className="text-center p-4">
        <p className="text-muted-foreground mb-2">{message}</p>
        <Button onClick={onRetry}>
          Retry
        </Button>
      </div>
    </div>
  );
};

export default MapErrorState;
