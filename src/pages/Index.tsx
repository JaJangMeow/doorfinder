import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import PropertyCard from "@/components/PropertyCard";
import Button from "@/components/Button";
import TabBar from "@/components/TabBar";
import { Building, ChevronDown, BookOpen } from "lucide-react";
import { getProperties } from "@/services/propertyService";
import { useToast } from "@/components/ui/use-toast";
const Index: React.FC = () => {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const {
    data: properties,
    isLoading,
    error
  } = useQuery({
    queryKey: ['properties'],
    queryFn: () => getProperties()
  });
  React.useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load properties. Please try again later.",
        variant: "destructive"
      });
    }
  }, [error, toast]);
  return <div className="min-h-screen pb-16 overflow-x-hidden">
      <Navbar />
      
      {/* Hero Section with Classroom Illustration */}
      <section className="relative min-h-[90vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-primary/5 z-10" />
          <img src="/lovable-uploads/83895367-873f-49ab-ab0f-09cf6a9ea424.png" alt="Classroom illustration" className="w-full h-full object-cover opacity-90" />
        </div>
        
        <div className="container mx-auto px-4 z-10 animate-fade-in">
          <div className="max-w-lg bg-white/80 backdrop-blur-sm p-8 rounded-lg shadow-sm">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 animate-slide-up">
              Find Your Perfect <span className="text-primary">Student Housing</span>
            </h1>
            <p className="text-muted-foreground mb-6 animate-slide-up" style={{
            animationDelay: "100ms"
          }}>
              Connect with fellow students and find affordable housing near your campus.
            </p>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-float">
          <button onClick={() => {
          const featuredSection = document.getElementById('featured-properties');
          if (featuredSection) {
            featuredSection.scrollIntoView({
              behavior: 'smooth'
            });
          }
        }} className="flex flex-col items-center text-primary hover:text-primary/80 transition-colors bg-white/80 p-3 rounded-full shadow-sm">
            <ChevronDown size={24} />
          </button>
        </div>
      </section>
      
      {/* Featured Properties - Simplified */}
      <section id="featured-properties" className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-semibold">Featured Housing</h2>
            <Button variant="ghost" onClick={() => navigate('/search')} className="text-primary">
              View all
            </Button>
          </div>
          
          {isLoading ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(index => <div key={index} className="h-64 bg-muted animate-pulse rounded-lg" />)}
            </div> : properties && properties.length > 0 ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.slice(0, 3).map((property, index) => <PropertyCard key={property.id} property={property} className="animate-scale-in" style={{
            animationDelay: `${index * 100}ms`
          }} />)}
            </div> : <div className="text-center py-8 bg-muted/30 rounded-lg">
              <Building size={48} className="mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No properties available right now.</p>
              <Button variant="link" onClick={() => navigate('/post')} className="mt-2">
                Be the first to post a property
              </Button>
            </div>}
        </div>
      </section>
      
      {/* How It Works - More Minimal */}
      <section className="py-12 bg-primary/5">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-semibold mb-8 text-center">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="text-primary" size={20} />
              </div>
              <h3 className="text-lg font-medium mb-2">Browse</h3>
              <p className="text-muted-foreground text-sm">
                Find housing near your campus
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Building className="text-primary" size={20} />
              </div>
              <h3 className="text-lg font-medium mb-2">Connect</h3>
              <p className="text-muted-foreground text-sm">
                Chat with student landlords
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="text-primary" size={20} />
              </div>
              <h3 className="text-lg font-medium mb-2">Move In</h3>
              <p className="text-muted-foreground text-sm">
                Enjoy your new student home
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Simplified Footer */}
      <footer className="bg-white py-8 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <h3 className="font-medium mb-3 text-sm">About</h3>
              <ul className="space-y-2 text-sm">
                <li className="Hello"><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Our Story</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">How It Works</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-3 text-sm">Support</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Contact Us</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-3 text-sm">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Privacy</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Terms</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-3 text-sm">Get Started</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="/post" className="text-muted-foreground hover:text-primary transition-colors">List Housing</a></li>
                <li><a href="/search" className="text-muted-foreground hover:text-primary transition-colors">Find Housing</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-border text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} DoorFinder. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* TabBar */}
      <TabBar />
    </div>;
};
export default Index;