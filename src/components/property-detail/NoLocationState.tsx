
import React from 'react';
import { Button } from '@/components/ui/button';

interface NoLocationStateProps {
  onSearchAddress: () => void;
}

const NoLocationState: React.FC<NoLocationStateProps> = ({ onSearchAddress }) => {
  return (
    <div className="rounded-xl overflow-hidden bg-muted h-[400px] flex items-center justify-center">
      <div className="text-center p-4">
        <p className="text-muted-foreground mb-4">Map coordinates not available</p>
        <Button onClick={onSearchAddress}>
          Search Address in Google Maps
        </Button>
      </div>
    </div>
  );
};

export default NoLocationState;
