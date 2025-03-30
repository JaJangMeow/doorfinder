import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Menu, X, Home, LogOut, Settings, User } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Close mobile menu when navigating
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Handle scroll detection for shadow
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle logo click
  const handleLogoClick = () => {
    navigate("/home");
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 py-3 bg-background/80 backdrop-blur-lg transition-all duration-300 safe-area-top",
      scrolled ? "shadow-md" : "shadow-sm"
    )}>
      <div className="container mx-auto px-4 flex items-center justify-center">
        {/* Mobile Menu Button (Left side) */}
        <button
          onClick={() => {
            setIsMobileMenuOpen(!isMobileMenuOpen);
            // Add haptic feedback if available
            if ('vibrate' in navigator) {
              navigator.vibrate(5);
            }
          }}
          className="md:hidden absolute left-4 p-1 rounded-full hover:bg-muted active:bg-muted/80 transition-colors"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6 animate-fade-in" />
          ) : (
            <Menu className="h-6 w-6 animate-fade-in" />
          )}
        </button>
        
        {/* Logo now centered and clickable with animation */}
        <div 
          className="text-xl font-semibold text-foreground cursor-pointer transition-transform duration-300 hover:scale-105 active:scale-95"
          onClick={handleLogoClick}
        >
          <span className="text-primary font-bold">Door</span>
          <span>Finder</span>
        </div>

        {/* Mobile Menu */}
        <div
          className={cn(
            "fixed top-[57px] left-0 right-0 bg-background/95 backdrop-blur-lg shadow-lg md:hidden transition-all duration-300 ease-out transform z-40 border-b border-border",
            isMobileMenuOpen ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0 pointer-events-none"
          )}
        >
          <div className="container mx-auto px-4 py-4 space-y-4">
            <nav className="flex flex-col space-y-1">
              {location.pathname === "/" ? (
                <>
                  <Link
                    to="/login"
                    className={cn(
                      "py-3 px-4 rounded-md flex items-center",
                      location.pathname.includes("/login") 
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted active:bg-muted/80"
                    )}
                  >
                    <User className="mr-3 h-5 w-5" />
                    <span>Sign in</span>
                  </Link>
                  <Link
                    to="/register"
                    className={cn(
                      "py-3 px-4 rounded-md flex items-center",
                      location.pathname.includes("/register") 
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted active:bg-muted/80"
                    )}
                  >
                    <User className="mr-3 h-5 w-5" />
                    <span>Register</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/home"
                    className={cn(
                      "py-3 px-4 rounded-md flex items-center",
                      location.pathname === "/home" 
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted active:bg-muted/80"
                    )}
                  >
                    <Home className="mr-3 h-5 w-5" />
                    <span>Home</span>
                  </Link>
                  
                  <Link
                    to="/profile"
                    className={cn(
                      "py-3 px-4 rounded-md flex items-center",
                      location.pathname === "/profile" 
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted active:bg-muted/80"
                    )}
                  >
                    <Settings className="mr-3 h-5 w-5" />
                    <span>Settings</span>
                  </Link>
                  
                  <button
                    onClick={handleSignOut}
                    className="py-3 px-4 rounded-md text-left flex items-center hover:bg-muted active:bg-muted/80 w-full text-destructive"
                  >
                    <LogOut className="mr-3 h-5 w-5" />
                    <span>Sign out</span>
                  </button>
                </>
              )}
            </nav>
          </div>
        </div>
        
        {/* Overlay for mobile menu */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/20 z-30 md:hidden animate-fade-in"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
        )}
      </div>
    </header>
  );
};

export default Navbar;
