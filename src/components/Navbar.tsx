
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Menu, X, User, LogIn } from "lucide-react";
import Button from "./Button";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Detect user authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
      
      if (data.session) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.session.user.id)
          .maybeSingle();
          
        setUserProfile(profileData);
      }
    };
    
    checkAuth();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Navbar auth event:", event);
        setIsAuthenticated(!!session);
        
        if (session) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();
            
          setUserProfile(profileData);
        } else {
          setUserProfile(null);
        }
      }
    );
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Close mobile menu when navigating
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Handle logo click
  const handleLogoClick = () => {
    navigate(isAuthenticated ? "/home" : "/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 py-3 bg-background/80 backdrop-blur-lg shadow-sm">
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Mobile Menu Button (Left side) */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
        
        {/* Auth Buttons - Desktop only (Profile on left) */}
        <div className="hidden md:flex items-center">
          {isAuthenticated ? (
            <Link to="/profile">
              <Button
                variant="ghost"
                size="sm"
                iconLeft={<User size={16} />}
              >
                {userProfile?.full_name || 'Profile'}
              </Button>
            </Link>
          ) : (
            <Link to="/login">
              <Button
                variant="ghost"
                size="sm"
                iconLeft={<LogIn size={16} />}
              >
                Sign in
              </Button>
            </Link>
          )}
        </div>

        {/* Logo now clickable */}
        <div 
          className="text-xl font-semibold text-foreground cursor-pointer"
          onClick={handleLogoClick}
        >
          <span className="text-primary font-bold">Door</span>
          <span>Finder</span>
        </div>

        {/* Empty space to balance the layout */}
        <div className="hidden md:block"></div>

        {/* Mobile Menu */}
        <div
          className={cn(
            "absolute top-full left-0 right-0 bg-background shadow-lg md:hidden transition-transform duration-300 ease-in-out transform glass",
            isMobileMenuOpen ? "translate-y-0" : "-translate-y-full"
          )}
        >
          <div className="container mx-auto px-4 py-4 space-y-4">
            <nav className="flex flex-col space-y-3">
              {isAuthenticated ? (
                <Link
                  to="/profile"
                  className={cn(
                    "py-2 px-4 rounded-md",
                    location.pathname === "/profile" 
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted"
                  )}
                >
                  Profile
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className={cn(
                      "py-2 px-4 rounded-md",
                      location.pathname === "/login" 
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted"
                    )}
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className={cn(
                      "py-2 px-4 rounded-md",
                      location.pathname === "/register" 
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted"
                    )}
                  >
                    Register
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
