
import React from 'react';
import { Image } from 'lucide-react';

// Only show if there is really no media – height now 300/400px for consistency.
const EmptyGalleryState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[300px] md:h-[400px] border border-dashed border-muted-foreground/30 rounded-lg bg-muted/30 p-4 text-center">
      <Image className="h-12 w-12 text-muted-foreground mb-2" />
      <h3 className="text-lg font-medium mb-1">No Media Available</h3>
      <p className="text-sm text-muted-foreground max-w-md">
        There are no images or videos available for this property listing.
      </p>
    </div>
  );
};

export default EmptyGalleryState;
