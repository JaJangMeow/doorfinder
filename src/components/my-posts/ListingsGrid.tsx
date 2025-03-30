
import React from "react";
import { Trash } from "lucide-react";
import { PropertyData } from "@/components/PropertyCard";
import PropertyCard from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";

interface ListingsGridProps {
  listings: PropertyData[];
  onDeleteClick: (id: string) => void;
}

const ListingsGrid = ({ listings, onDeleteClick }: ListingsGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {listings.map((property) => (
        <div key={property.id} className="group relative">
          <PropertyCard property={property} />
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDeleteClick(property.id)}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash size={16} className="mr-1" />
            Delete
          </Button>
        </div>
      ))}
    </div>
  );
};

export default ListingsGrid;
