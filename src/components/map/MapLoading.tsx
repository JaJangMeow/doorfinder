
import React from 'react';

export const MapLoading: React.FC = () => {
  return (
    <div className="w-full h-[400px] rounded-lg bg-muted flex items-center justify-center">
      <div className="text-center p-4">
        <div className="w-8 h-8 border-4 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    </div>
  );
};
