
import React from "react";
import Navbar from "@/components/Navbar";
import TabBar from "@/components/TabBar";
import { Heart } from "lucide-react";
import Button from "@/components/Button";
import { Link } from "react-router-dom";

const SavedPage: React.FC = () => {
  // In a real app, this would fetch saved properties from a database or local storage
  const savedProperties = [];

  return (
    <div className="min-h-screen pb-16">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Saved Properties</h1>
          
          {savedProperties.length === 0 ? (
            <div className="py-12 text-center">
              <div className="inline-flex flex-col items-center text-muted-foreground">
                <Heart size={48} className="mb-4 opacity-20" />
                <p className="text-lg mb-4">You haven't saved any properties yet</p>
                <Link to="/">
                  <Button>Explore Properties</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Property cards would go here */}
            </div>
          )}
        </div>
      </div>
      <TabBar />
    </div>
  );
};

export default SavedPage;
