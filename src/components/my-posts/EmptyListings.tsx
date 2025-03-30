
import React from "react";
import { Building, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const EmptyListings = () => {
  return (
    <div className="py-12 text-center">
      <div className="inline-flex flex-col items-center text-muted-foreground">
        <Building size={48} className="mb-4 opacity-20" />
        <p className="text-lg mb-4">You haven't posted any properties yet</p>
        <Link to="/post">
          <Button className="flex items-center gap-2">
            <Plus size={18} />
            <span>Add New Property</span>
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default EmptyListings;
