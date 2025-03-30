
import React from "react";
import { Loader2 } from "lucide-react";

const LoadingListings = () => {
  return (
    <div className="py-12 text-center">
      <Loader2 size={48} className="mx-auto animate-spin text-primary opacity-70" />
      <p className="mt-4 text-muted-foreground">Loading your listings...</p>
    </div>
  );
};

export default LoadingListings;
