
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, User } from "lucide-react";
import Button from "@/components/Button";
import { supabase } from "@/lib/supabase";

const WelcomePage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate('/browse');
      }
    };
    
    checkSession();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-primary/10 -z-10" />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo and Branding */}
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="flex items-center justify-center text-3xl font-bold text-foreground mb-2">
              <span className="text-primary font-bold">Door</span>
              <span>Finder</span>
            </h1>
            <p className="text-muted-foreground">Find your perfect student housing</p>
          </div>
          
          {/* Auth Buttons */}
          <div className="space-y-4 mt-8">
            <Button 
              variant="primary" 
              size="lg"
              fullWidth
              iconRight={<ChevronRight size={18} />}
              onClick={() => navigate('/login')}
              className="h-14 animate-fade-in"
              style={{ animationDelay: '100ms' }}
            >
              Login to Your Account
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              fullWidth
              iconRight={<User size={18} />}
              onClick={() => navigate('/register')}
              className="h-14 animate-fade-in"
              style={{ animationDelay: '200ms' }}
            >
              Create New Account
            </Button>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="py-4 text-center text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '400ms' }}>
        <p>© {new Date().getFullYear()} DoorFinder. All rights reserved.</p>
      </div>
    </div>
  );
};

export default WelcomePage;
