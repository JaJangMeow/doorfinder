
import React from "react";
import { Image, MapPin } from "lucide-react";
import MediaUploader from "@/components/MediaUploader";
import LocationPicker from "@/components/LocationPicker";
import { Coordinates, MediaItem } from "@/types/property";

interface PropertyMediaFormProps {
  media: MediaItem[];
  coordinates: Coordinates;
  onMediaChange: (media: MediaItem[]) => void;
  onLocationSelect: (coordinates: Coordinates) => void;
}

const PropertyMediaForm: React.FC<PropertyMediaFormProps> = ({
  media,
  coordinates,
  onMediaChange,
  onLocationSelect,
}) => {
  return (
    <>
      <div className="glass rounded-xl p-6 space-y-6">
        <h2 className="text-xl font-semibold flex items-center">
          <Image className="mr-2 text-primary" size={20} />
          Property Images & Videos
        </h2>
        
        <div className="space-y-4">
          <MediaUploader 
            onMediaChange={onMediaChange}
            initialMedia={media}
            maxImages={10}
            maxVideos={5}
          />
        </div>
      </div>
      
      <div className="glass rounded-xl p-6 space-y-6 mt-6">
        <h2 className="text-xl font-semibold flex items-center">
          <MapPin className="mr-2 text-primary" size={20} />
          Property Location
        </h2>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Search for your address or landmark, then fine-tune the exact location by dragging the marker.
          </p>
          <LocationPicker 
            onLocationSelect={onLocationSelect}
            defaultLocation={coordinates}
            height="400px"
            zoom={15}
          />
        </div>
      </div>
    </>
  );
};

export default PropertyMediaForm;
