import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { MapPin, Calendar, Home, Bath, ChevronRight, Check, Heart } from "lucide-react";
import { Link } from "react-router-dom";

export interface PropertyData {
  id: string;
  title: string;
  address: string;
  price: number;
  bedrooms: number;
  availableFrom: string;
  imageUrl: string;
  latitude: number | null;
  longitude: number | null;
  distance?: number;
  bathrooms?: number;
  hasHall?: boolean;
  hasSeparateKitchen?: boolean;
}

interface PropertyCardProps {
  property: PropertyData;
  className?: string;
  style?: React.CSSProperties;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, className, style }) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (imageRef.current && imageRef.current.complete) {
      setIsImageLoaded(true);
    }
  }, []);

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Format price with commas
  const formatPrice = (price: number) => {
    return price.toLocaleString("en-US");
  };

  // Handle touch events for mobile
  const handleTouchStart = () => {
    setIsTouched(true);
    // Add haptic feedback if available
    if ('vibrate' in navigator) {
      navigator.vibrate(5);
    }
  };

  const handleTouchEnd = () => {
    setIsTouched(false);
  };

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    
    // Add haptic feedback if available
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  return (
    <div
      ref={cardRef}
      className={cn(
        "group relative overflow-hidden rounded-2xl bg-card border border-border/40 transition-all duration-300 card-hover",
        isHovered || isTouched ? "shadow-md" : "shadow-sm",
        className
      )}
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Image with loading state */}
      <div
        className={cn(
          "relative h-48 w-full overflow-hidden",
          !isImageLoaded && "image-loading"
        )}
      >
        <img
          ref={imageRef}
          src={property.imageUrl}
          alt={property.title}
          onLoad={() => setIsImageLoaded(true)}
          className={cn(
            "h-full w-full object-cover transition-all duration-700",
            isImageLoaded ? "opacity-100" : "opacity-0",
            (isHovered || isTouched) && "scale-[1.05]"
          )}
        />
        <div className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/30 to-transparent transition-opacity duration-300",
          (isHovered || isTouched) ? "opacity-100" : "opacity-0"
        )} />
        
        {/* Favorite Button */}
        <button 
          onClick={toggleFavorite}
          className={cn(
            "absolute top-3 right-3 z-20 p-2 rounded-full transition-all duration-300 transform",
            isFavorite 
              ? "bg-primary text-white" 
              : "bg-white/80 text-foreground backdrop-blur-sm",
            (isHovered || isTouched) ? "scale-100 opacity-100" : "scale-90 opacity-0"
          )}
        >
          <Heart 
            size={18} 
            className={cn(
              "transition-transform duration-300",
              isFavorite && "fill-current animate-scale-in"
            )}
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-3">
          <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary mb-2">
            Available {formatDate(property.availableFrom)}
          </span>
          <h3 className="font-medium text-lg mb-1 text-balance line-clamp-1">{property.title}</h3>
          <div className="flex items-center text-muted-foreground text-sm">
            <MapPin size={14} className="mr-1 shrink-0" />
            <span className="truncate">{property.address}</span>
          </div>
        </div>

        {/* Amenities */}
        <div className="flex flex-wrap gap-2 mb-3">
          {property.hasHall && (
            <span className="text-xs bg-muted py-1 px-2 rounded-full flex items-center">
              <Check size={12} className="mr-1 text-primary" />
              Hall
            </span>
          )}
          {property.hasSeparateKitchen && (
            <span className="text-xs bg-muted py-1 px-2 rounded-full flex items-center">
              <Check size={12} className="mr-1 text-primary" />
              Kitchen
            </span>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex gap-3">
            <div className="flex items-center text-sm">
              <Home size={14} className="mr-1 text-muted-foreground" />
              <span>{property.bedrooms} {property.bedrooms === 1 ? 'bed' : 'beds'}</span>
            </div>
            {property.bathrooms && (
              <div className="flex items-center text-sm">
                <Bath size={14} className="mr-1 text-muted-foreground" />
                <span>{property.bathrooms} {property.bathrooms === 1 ? 'bath' : 'baths'}</span>
              </div>
            )}
          </div>
          <div className="font-semibold">${formatPrice(property.price)}</div>
        </div>

        {property.distance !== undefined && (
          <div className="mt-2 text-xs text-muted-foreground">
            <span className="flex items-center">
              <MapPin size={12} className="mr-1 shrink-0" />
              {property.distance.toFixed(1)} km away
            </span>
          </div>
        )}

        <Link
          to={`/property/${property.id}`}
          className={cn(
            "absolute inset-0 z-10 flex items-end justify-end p-4 opacity-0 transition-all duration-300",
            (isHovered || isTouched) && "opacity-100"
          )}
        >
          <span className="flex items-center justify-center rounded-full bg-primary w-10 h-10 text-primary-foreground shadow-lg transform transition-transform duration-300 group-hover:scale-110 active:scale-95">
            <ChevronRight size={18} />
          </span>
        </Link>
      </div>
    </div>
  );
};

export default PropertyCard;
