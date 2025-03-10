import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { MapPin, Calendar, Home, ChevronRight } from "lucide-react";
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
  const imageRef = useRef<HTMLImageElement>(null);

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

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl bg-card transition-all duration-300 card-hover",
        className
      )}
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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
            isHovered && "scale-[1.05]"
          )}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-3">
          <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary mb-2">
            Available {formatDate(property.availableFrom)}
          </span>
          <h3 className="font-medium text-lg mb-1 text-balance">{property.title}</h3>
          <div className="flex items-center text-muted-foreground text-sm">
            <MapPin size={14} className="mr-1" />
            <span className="truncate">{property.address}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex gap-3">
            <div className="flex items-center text-sm">
              <Home size={14} className="mr-1 text-muted-foreground" />
              <span>{property.bedrooms} {property.bedrooms === 1 ? 'bed' : 'beds'}</span>
            </div>
            <div className="flex items-center text-sm">
              <Calendar size={14} className="mr-1 text-muted-foreground" />
              <span>{formatDate(property.availableFrom)}</span>
            </div>
          </div>
          <div className="font-semibold">${formatPrice(property.price)}</div>
        </div>

        <Link
          to={`/property/${property.id}`}
          className={cn(
            "absolute inset-0 z-10 flex items-end justify-end p-4 opacity-0 transition-opacity duration-300",
            isHovered && "opacity-100"
          )}
        >
          <span className="flex items-center justify-center rounded-full bg-primary w-10 h-10 text-primary-foreground shadow-lg transform transition-transform duration-300 group-hover:scale-110">
            <ChevronRight size={18} />
          </span>
        </Link>
      </div>
    </div>
  );
};

export default PropertyCard;
