
import React from 'react';
import { MapPin, Heart, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PropertyHeaderProps {
  title: string;
  address: string;
  price: number;
  availableFrom: string;
  depositAmount?: number;
  isSaved: boolean;
  isLoading: boolean;
  onSaveToggle: () => void;
}

const PropertyHeader: React.FC<PropertyHeaderProps> = ({
  title,
  address,
  price,
  availableFrom,
  depositAmount,
  isSaved,
  isLoading,
  onSaveToggle
}) => {
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onSaveToggle}
          disabled={isLoading}
          className="sm:hidden"
        >
          <Heart 
            className={isSaved ? "fill-primary text-primary" : "text-muted-foreground"} 
            size={20} 
          />
        </Button>
      </div>
      <div className="flex items-center text-gray-600 mt-2">
        <MapPin className="mr-2 h-5 w-5" />
        {address}
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-gray-900">₹{price} / month</span>
          <span className="text-gray-600">
            Available from <Calendar className="inline-block mr-1 h-4 w-4" />
            {new Date(availableFrom).toLocaleDateString()}
          </span>
        </div>

        {depositAmount && (
          <div className="mt-2 text-gray-700">
            <span className="font-medium">Security Deposit:</span> ₹{depositAmount}
          </div>
        )}
      </div>
    </>
  );
};

export default PropertyHeader;
