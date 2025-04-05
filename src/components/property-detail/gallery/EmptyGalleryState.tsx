
import React from 'react';
import { AlertTriangle } from 'lucide-react';

const EmptyGalleryState: React.FC = () => {
  return (
    <div className="relative h-96 rounded-xl overflow-hidden bg-muted flex flex-col items-center justify-center">
      <AlertTriangle size={48} className="text-muted-foreground mb-4" />
      <p className="text-muted-foreground text-lg">No media available</p>
      <p className="text-muted-foreground text-sm mt-2">
        This property has no images or videos to display
      </p>
    </div>
  );
};

export default EmptyGalleryState;
