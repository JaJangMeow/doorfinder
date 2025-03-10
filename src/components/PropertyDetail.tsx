
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { MapPin, Calendar, DollarSign, BedDouble, Bath, Home, ArrowLeft } from "lucide-react";
import Button from "./Button";
import { Link } from "react-router-dom";

// Extended property data for detailed view
export interface PropertyDetailData {
  id: string;
  title: string;
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  availableFrom: string;
  description: string;
  images: string[];
  contactName: string;
  contactEmail: string;
  contactPhone: string;
}

interface PropertyDetailProps {
  property: PropertyDetailData;
  className?: string;
}

const PropertyDetail: React.FC<PropertyDetailProps> = ({ property, className }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState<Record<number, boolean>>({});

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  // Format price with commas
  const formatPrice = (price: number) => {
    return price.toLocaleString("en-US");
  };

  const handleImageLoad = (index: number) => {
    setImagesLoaded((prev) => ({ ...prev, [index]: true }));
  };

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === property.images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? property.images.length - 1 : prevIndex - 1
    );
  };

  return (
    <div className={cn("max-w-5xl mx-auto", className)}>
      <div className="mb-6">
        <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={16} className="mr-1" /> Back to listings
        </Link>
      </div>
      
      {/* Image gallery */}
      <div className="relative overflow-hidden rounded-2xl mb-8 aspect-[16/9]">
        {property.images.map((image, index) => (
          <div 
            key={index}
            className={cn(
              "absolute inset-0 transition-opacity duration-500",
              index === currentImageIndex ? "opacity-100 z-10" : "opacity-0 z-0",
              !imagesLoaded[index] && "image-loading"
            )}
          >
            <img
              src={image}
              alt={`${property.title} - image ${index + 1}`}
              className={cn(
                "w-full h-full object-cover",
                imagesLoaded[index] ? "opacity-100" : "opacity-0"
              )}
              onLoad={() => handleImageLoad(index)}
            />
          </div>
        ))}
        
        {/* Image navigation */}
        {property.images.length > 1 && (
          <>
            <button 
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-200 transform hover:scale-105"
              aria-label="Previous image"
            >
              <ArrowLeft size={20} />
            </button>
            <button 
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-200 transform hover:scale-105"
              aria-label="Next image"
            >
              <ArrowLeft size={20} className="rotate-180" />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
              {property.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300",
                    index === currentImageIndex 
                      ? "bg-white w-6" 
                      : "bg-white/50 hover:bg-white/80"
                  )}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div>
            <h1 className="text-3xl font-semibold mb-2">{property.title}</h1>
            <p className="flex items-center text-muted-foreground">
              <MapPin size={16} className="mr-1" />
              {property.address}
            </p>
          </div>

          <div className="flex flex-wrap gap-6 py-4 border-y border-border">
            <div className="flex items-center">
              <DollarSign size={18} className="mr-2 text-primary" />
              <div>
                <p className="font-medium">${formatPrice(property.price)}</p>
                <p className="text-xs text-muted-foreground">per month</p>
              </div>
            </div>
            <div className="flex items-center">
              <BedDouble size={18} className="mr-2 text-primary" />
              <div>
                <p className="font-medium">{property.bedrooms}</p>
                <p className="text-xs text-muted-foreground">Bedrooms</p>
              </div>
            </div>
            <div className="flex items-center">
              <Bath size={18} className="mr-2 text-primary" />
              <div>
                <p className="font-medium">{property.bathrooms}</p>
                <p className="text-xs text-muted-foreground">Bathrooms</p>
              </div>
            </div>
            <div className="flex items-center">
              <Home size={18} className="mr-2 text-primary" />
              <div>
                <p className="font-medium">{property.squareFeet} sq ft</p>
                <p className="text-xs text-muted-foreground">Living Area</p>
              </div>
            </div>
            <div className="flex items-center">
              <Calendar size={18} className="mr-2 text-primary" />
              <div>
                <p className="font-medium">{formatDate(property.availableFrom)}</p>
                <p className="text-xs text-muted-foreground">Available From</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-medium mb-3">Description</h2>
            <div className="text-muted-foreground space-y-4">
              {property.description.split('\n\n').map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="glass sticky top-6 rounded-xl p-6 space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{property.contactName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{property.contactEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{property.contactPhone}</p>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-border">
              <Button fullWidth>Contact Property Manager</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
