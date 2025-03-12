
// This component has been replaced by PropertyMediaGallery.tsx
// This file is kept for backward compatibility but redirects to the new component

import React from 'react';
import PropertyMediaGallery from './PropertyMediaGallery';

interface PropertyImageGalleryProps {
  images: string[];
  title: string;
  isSaved: boolean;
  isLoading: boolean;
  onSaveToggle: () => void;
}

const PropertyImageGallery: React.FC<PropertyImageGalleryProps> = (props) => {
  // Convert legacy format to new media format
  const media = props.images.map(url => ({ url, type: 'image' as const }));
  
  return (
    <PropertyMediaGallery
      media={media}
      title={props.title}
      isSaved={props.isSaved}
      isLoading={props.isLoading}
      onSaveToggle={props.onSaveToggle}
    />
  );
};

export default PropertyImageGallery;
