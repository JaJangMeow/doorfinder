import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, User, Home } from "lucide-react";
import Button from "@/components/Button";
import { supabase } from "@/lib/supabase";

const WelcomePage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate('/home');
      }
    };
    
    checkSession();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-primary/10" />
        <div className="absolute -inset-[100%] animate-[spin_60s_linear_infinite] opacity-30">
          <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute top-2/3 right-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-3xl" />
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 safe-area-inset">
        <div className="w-full max-w-md">
          {/* Logo and Branding */}
          <div className="text-center mb-10 animate-fade-in">
            <div className="inline-flex items-center mb-4 relative">
              <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center animate-float">
                <Home className="text-primary w-8 h-8" />
              </div>
            </div>
            <h1 className="flex items-center justify-center text-4xl font-bold text-foreground mb-2">
              <span className="text-primary font-bold animate-slide-up" style={{ animationDelay: '100ms' }}>Door</span>
              <span className="animate-slide-up" style={{ animationDelay: '200ms' }}>Finder</span>
            </h1>
            <p className="text-muted-foreground animate-slide-up" style={{ animationDelay: '300ms' }}>Find your perfect student housing</p>
          </div>
          
          {/* Auth Buttons */}
          <div className="space-y-4 mt-10">
            <Button 
              variant="primary" 
              size="lg"
              fullWidth
              iconRight={<ChevronRight size={18} />}
              onClick={() => navigate('/login')}
              className="h-14 animate-slide-up shadow-sm"
              style={{ animationDelay: '400ms' }}
            >
              Login to Your Account
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              fullWidth
              iconRight={<User size={18} />}
              onClick={() => navigate('/register')}
              className="h-14 animate-slide-up backdrop-blur-sm bg-white/80 border-border/50"
              style={{ animationDelay: '500ms' }}
            >
              Create New Account
            </Button>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="py-4 text-center text-sm text-muted-foreground animate-fade-in safe-area-bottom" style={{ animationDelay: '600ms' }}>
        <p>© {new Date().getFullYear()} DoorFinder. All rights reserved.</p>
      </div>
    </div>
  );
};

export default WelcomePage;
