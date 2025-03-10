
import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Home, User } from "lucide-react";
import Button from "@/components/Button";
import { cn } from "@/lib/utils";

const WelcomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-primary/10 -z-10" />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo and Branding */}
          <div className="text-center mb-8">
            <h1 className="flex items-center justify-center text-3xl font-bold text-foreground mb-2">
              <span className="text-primary font-bold">Door</span>
              <span>Finder</span>
            </h1>
            <p className="text-muted-foreground">Find your perfect student housing</p>
          </div>
          
          {/* Welcome Image */}
          <div className="relative rounded-xl overflow-hidden mb-8 shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10" />
            <img 
              src="/lovable-uploads/83895367-873f-49ab-ab0f-09cf6a9ea424.png" 
              alt="Student housing" 
              className="w-full aspect-[16/9] object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
              <h2 className="text-white text-xl font-semibold">Connect with fellow students</h2>
              <p className="text-white/80 text-sm">Find affordable housing near your campus</p>
            </div>
          </div>
          
          {/* Auth Buttons */}
          <div className="space-y-4">
            <Button 
              variant="primary" 
              size="lg"
              fullWidth
              iconRight={<ChevronRight size={18} />}
              onClick={() => navigate('/login')}
              className="h-14"
            >
              Login to Your Account
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              fullWidth
              iconRight={<User size={18} />}
              onClick={() => navigate('/register')}
              className="h-14"
            >
              Create New Account
            </Button>
            
            <Button 
              variant="ghost" 
              size="md"
              fullWidth
              iconRight={<Home size={18} />}
              onClick={() => navigate('/browse')}
              className="mt-4"
            >
              Browse as Guest
            </Button>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="py-4 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} DoorFinder. All rights reserved.</p>
      </div>
    </div>
  );
};

export default WelcomePage;
